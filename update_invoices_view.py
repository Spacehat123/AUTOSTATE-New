import re

with open('apps/web/src/components/invoices/invoices-payments-view.tsx', 'r') as f:
    content = f.read()

# Add imports
content = re.sub(
    r"import \{ FileText,",
    r"import { RecordPaymentModal } from '@/components/invoices/record-payment-modal'\nimport { FileText, DollarSign,",
    content
)

# Invoice Table needs the RecordPaymentModal
# Find the Filters section and add the button next to it
filters_section = r"""      \{\/\* Filters \*\/\}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">"""

filters_replacement = """      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">"""

content = re.sub(filters_section, filters_replacement, content)

# Close the new div and add the Record Payment button
end_filters = r"""          \}\)\)}
        <\/div>
      <\/div>"""

end_filters_replacement = """          }))}
        </div>
        </div>
        <RecordPaymentModal 
          openInvoices={invoices.filter(i => i.status !== 'PAID') as any}
          trigger={
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
              <DollarSign className="w-4 h-4" />
              Record Payment
            </button>
          }
        />
      </div>"""

content = re.sub(end_filters, end_filters_replacement, content)

with open('apps/web/src/components/invoices/invoices-payments-view.tsx', 'w') as f:
    f.write(content)
