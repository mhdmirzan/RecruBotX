from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
import asyncio
from typing import Dict
import uuid

from database.connection import get_database
from services.interview_service import InterviewService

router = APIRouter(prefix="/ws", tags=["Interview WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Maps session_id to WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_json(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

import re

class TTSSender:
    def __init__(self, session_id: str, manager: ConnectionManager, tts_service):
        self.session_id = session_id
        self.manager = manager
        self.tts_service = tts_service
        self.queue = asyncio.Queue()
        self.worker = asyncio.create_task(self._process_queue())
        
    async def put(self, sentence: str):
        await self.queue.put(sentence)
             
    async def _process_queue(self):
        while True:
            sentence = await self.queue.get()
            if sentence is None: 
                break
            try:
                tts_bytes = await self.tts_service.generate_speech(sentence)
                if tts_bytes:
                    import base64
                    b64 = base64.b64encode(tts_bytes).decode('utf-8')
                    await self.manager.send_json(self.session_id, {
                        "type": "audio_output",
                        "payload": b64,
                        "sentence": sentence
                    })
            except Exception as e:
                print(f"TTS streaming error for sentence: {e}")
            finally:
                self.queue.task_done()
            
    async def close(self):
        await self.queue.put(None)
        await self.worker

manager = ConnectionManager()


@router.websocket("/interview/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    
    # Import locally to avoid circular import since main.py imports this router
    from main import get_interview_service
    service = get_interview_service()
    
    # We must grab the DB dependency manually since it's a websocket and Depends(get_database)
    # can be tricky in older FastAPI versions without async generators
    # But since service already has db, we can use it.
    
    try:
        while True:
            # Wait for any message from the client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                payload = message.get("payload")
                
                if msg_type == "start_interview":
                    # Let the frontend know we are ready
                    await manager.send_json(session_id, {
                        "type": "session_created",
                        "payload": "Session connected securely."
                    })
                    
                    # Generate the first greeting via streaming chunker
                    tts_sender = TTSSender(session_id, manager, service.tts_service)
                    buffer = ""
                    async for chunk in service.process_input(session_id, "INIT"):
                        # Keep UI updated with chunk progress (technically deprecated for display, but good for logs/future)
                        await manager.send_json(session_id, {
                            "type": "text_chunk",
                            "payload": chunk
                        })
                        buffer += chunk
                        while len(buffer) > 40:
                            match = re.search(r'(?<=[.!?\n])\s+', buffer[40:])
                            if not match:
                                break
                            split_idx = 40 + match.start()
                            sentence = buffer[:split_idx].strip()
                            buffer = buffer[40 + match.end():].lstrip()
                            if sentence:
                                await tts_sender.put(sentence)
                                
                    if buffer.strip():
                        await tts_sender.put(buffer.strip())
                        
                    # Await all the queued audio generation and sending to finish
                    await tts_sender.close()
                elif msg_type == "audio_data":
                    # Candidate sent a chunk of microphone audio
                    import base64
                    audio_bytes = base64.b64decode(payload)
                    
                    transcription = await service.transcribe_audio(audio_bytes)
                    
                    if transcription and transcription.strip():
                        # Echo back transcription to UI
                        await manager.send_json(session_id, {
                            "type": "transcription",
                            "payload": transcription
                        })
                        
                        # Send transcription to LLM and stream response back
                        tts_sender = TTSSender(session_id, manager, service.tts_service)
                        buffer = ""
                        async for chunk in service.process_input(session_id, transcription):
                            await manager.send_json(session_id, {
                                "type": "text_chunk",
                                "payload": chunk
                            })
                            buffer += chunk
                            while len(buffer) > 40:
                                match = re.search(r'(?<=[.!?\n])\s+', buffer[40:])
                                if not match:
                                    break
                                split_idx = 40 + match.start()
                                sentence = buffer[:split_idx].strip()
                                buffer = buffer[40 + match.end():].lstrip()
                                if sentence:
                                    await tts_sender.put(sentence)
                                    
                        if buffer.strip():
                            await tts_sender.put(buffer.strip())
                            
                        await tts_sender.close()
                            
                        session_data = await service.get_session(session_id)
                        if session_data:
                            session, _ = session_data
                            if session.stage.value == "finished":
                                # Notify frontend we're calculating
                                await manager.send_json(session_id, {
                                    "type": "interview_concluding",
                                    "payload": "Calculating results..."
                                })
                                # Handle interview end
                                report_dict = await service.finalize_interview(session_id)
                                await manager.send_json(session_id, {
                                    "type": "report",
                                    "payload": report_dict
                                })
                elif msg_type == "text_data":
                    transcription = payload
                    if transcription and transcription.strip():
                        # Echo back transcription to UI
                        await manager.send_json(session_id, {
                            "type": "transcription",
                            "payload": transcription
                        })
                        
                        # Send transcription to LLM and stream response back
                        tts_sender = TTSSender(session_id, manager, service.tts_service)
                        buffer = ""
                        async for chunk in service.process_input(session_id, transcription):
                            await manager.send_json(session_id, {
                                "type": "text_chunk",
                                "payload": chunk
                            })
                            buffer += chunk
                            while len(buffer) > 40:
                                match = re.search(r'(?<=[.!?\n])\s+', buffer[40:])
                                if not match:
                                    break
                                split_idx = 40 + match.start()
                                sentence = buffer[:split_idx].strip()
                                buffer = buffer[40 + match.end():].lstrip()
                                if sentence:
                                    await tts_sender.put(sentence)
                                    
                        if buffer.strip():
                            await tts_sender.put(buffer.strip())
                            
                        await tts_sender.close()
                            
                        session_data = await service.get_session(session_id)
                        if session_data:
                            session, _ = session_data
                            if session.stage.value == "finished":
                                # Notify frontend we're calculating
                                await manager.send_json(session_id, {
                                    "type": "interview_concluding",
                                    "payload": "Calculating results..."
                                })
                                # Handle interview end
                                report_dict = await service.finalize_interview(session_id)
                                await manager.send_json(session_id, {
                                    "type": "report",
                                    "payload": report_dict
                                })
                elif msg_type == "interrupt":
                    # Handled natively by wiping the current audio play queue on frontend
                    # Nothing strictly needed on backend unless we want to flag the conversation
                    pass
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        manager.disconnect(session_id)
