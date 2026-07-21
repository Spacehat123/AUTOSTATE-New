import { PageHeader } from '@/components/shared/page-header'
import { CustomerTable } from '@/components/customers/customer-table'
import { getCurrentUser } from '@/lib/auth'
import { getCustomers } from '@/lib/services/customers'

export default async function CustomersPage() {
  const user = await getCurrentUser()
  const initialData = await getCustomers({
    db: user.db,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Customers" 
        subtitle="Manage your accounts receivable and track customer risk." 
      />
      
      <CustomerTable 
        initialData={initialData.data} 
        initialTotal={initialData.total} 
      />
    </div>
  )
}
