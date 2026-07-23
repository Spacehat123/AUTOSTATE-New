import re

with open('apps/web/src/components/customers/customer-actions.tsx', 'r') as f:
    content = f.read()

# Add import
content = re.sub(
    r"import \{ Dialog,",
    r"import { RecordPaymentModal } from '@/components/invoices/record-payment-modal'\nimport { Dialog,",
    content
)

# Replace Record Payment Dialog with the new component
pattern = r"\{\/\* Record Payment Dialog \*\/.*?<\/Dialog>"
replacement = """{/* Record Payment Dialog */}
        <RecordPaymentModal 
          openInvoices={openInvoices as any} 
          trigger={
            <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment
            </Button>
          } 
        />"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('apps/web/src/components/customers/customer-actions.tsx', 'w') as f:
    f.write(new_content)
