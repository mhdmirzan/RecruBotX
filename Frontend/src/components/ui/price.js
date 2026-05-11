import * as React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Check } from 'lucide-react';

const cardVariants = cva(
  'relative flex flex-col p-8 rounded-2xl border shadow-sm transition-all duration-300 h-full',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200',
        popular: 'bg-white border-blue-600 shadow-lg shadow-blue-600/10 -translate-y-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const PricingCard = React.forwardRef(
  (
    {
      className,
      variant,
      planName,
      description,
      price,
      billingCycle,
      features,
      buttonText,
      isCurrentPlan = false,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        {variant === 'popular' && (
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            POPULAR
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{planName}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>

        <div className="my-6">
          {typeof price === "number" ? (
             <span className="text-5xl font-bold">${price}</span>
          ) : (
             <span className="text-5xl font-bold">{price}</span>
          )}
          <span className="text-gray-500">{billingCycle}</span>
        </div>

        <Button
          className="w-full mb-8"
          size="lg"
          variant={isCurrentPlan ? 'secondary' : variant === 'popular' ? 'default' : 'outline'}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current plan' : buttonText}
        </Button>

        <ul className="space-y-4 text-sm text-gray-600 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }
);

PricingCard.displayName = 'PricingCard';

export { PricingCard };