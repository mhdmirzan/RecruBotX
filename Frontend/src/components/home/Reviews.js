import React from "react"
import { motion } from "framer-motion"

// Utility for merging classNames
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

// ✅ Card Components (merged directly here)
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-white text-gray-900 shadow-lg hover:shadow-xl transition-shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

// ✅ Reviews Section
const Reviews = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Talent, TechCorp",
      review:
        "RecruBotX reduced our hiring time by 30% while improving candidate quality."
    },
    {
      name: "David Smith",
      role: "Recruitment Lead, Innovate Ltd",
      review:
        "A seamless and efficient process. Highly recommended!"
    },
    {
      name: "Emily Johnson",
      role: "HR Director, HealthPlus",
      review:
        "The platform made hiring so much easier for our team. Saved us countless hours!"
    }
  ]

  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          What Our Clients Say
        </h2>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent>
                  {/* Stars */}
                  <div className="text-yellow-500 text-lg mb-4">⭐⭐⭐⭐⭐</div>
                  {/* Review */}
                  <p className="text-gray-700 italic mb-6">
                    "{t.review}"
                  </p>
                  {/* Name + Role */}
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reviews
