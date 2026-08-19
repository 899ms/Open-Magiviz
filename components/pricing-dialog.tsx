 "use client"

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PricingSection } from "./pricing-section"

interface PricingDialogProps {
  children: React.ReactNode
}

export function PricingDialog({ children }: PricingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-4 overflow-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Pricing</DialogTitle>
        </DialogHeader>
        <PricingSection />
      </DialogContent>
    </Dialog>
  )
}


