import re

with open('apps/web/src/components/invoices/invoices-payments-view.tsx', 'r') as f:
    content = f.read()

pattern = r"""          \}\)\)\}
        <\/div>
      <\/div>"""

replacement = """          }))}
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

content = re.sub(pattern, replacement, content)

with open('apps/web/src/components/invoices/invoices-payments-view.tsx', 'w') as f:
    f.write(content)
