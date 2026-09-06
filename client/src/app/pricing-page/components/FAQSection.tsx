'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection = ({ faqs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-card dark:bg-gradient-to-br dark:from-[#131726] dark:to-[#0F121E] border border-border dark:border-white/[0.08] hover:border-primary/30 rounded-xl overflow-hidden shadow-sm dark:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 dark:hover:bg-white/[0.03] transition-colors duration-200"
          >
            <span className="font-headline font-semibold text-foreground pr-4">
              {faq.question}
            </span>
            <Icon
              name="ChevronDownIcon"
              size={20}
              variant="outline"
              className={`text-primary transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed animate-slide-in-right border-t border-border dark:border-white/[0.04] pt-4">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQSection;