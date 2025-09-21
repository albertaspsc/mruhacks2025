import faqBackground from "@/assets/backgrounds/background.webp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import faqs from "@/data/faqs.json";

const FAQ = () => {
  return (
    <section
      id="faq"
      className="relative py-16 bg-cover bg-center rounded-xl"
      style={{ backgroundImage: `url(${faqBackground.src})` }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-4xl font-bold mb-8">FAQ</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
export default FAQ;
