'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompanySettings } from './company-settings'
import { UsersSettings } from './users-settings'
import { WhatsappSettings } from './whatsapp-settings'
import { EmailSettings } from './email-settings'
import { ImportSettings } from './import-settings'
import { AuditLogSettings } from './audit-log-settings'

export function SettingsLayout() {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="mb-6 bg-surface-card border border-surface-border overflow-x-auto justify-start w-full sm:w-auto h-auto p-1">
        <TabsTrigger value="company" className="px-4 py-2">Company</TabsTrigger>
        <TabsTrigger value="users" className="px-4 py-2">Users</TabsTrigger>
        <TabsTrigger value="whatsapp" className="px-4 py-2">WhatsApp</TabsTrigger>
        <TabsTrigger value="email" className="px-4 py-2">Email</TabsTrigger>
        <TabsTrigger value="import" className="px-4 py-2">Data Import</TabsTrigger>
        <TabsTrigger value="audit-log" className="px-4 py-2">Audit Log</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-0">
        <CompanySettings />
      </TabsContent>
      
      <TabsContent value="users" className="mt-0">
        <UsersSettings />
      </TabsContent>

      <TabsContent value="whatsapp" className="mt-0">
        <WhatsappSettings />
      </TabsContent>

      <TabsContent value="email" className="mt-0">
        <EmailSettings />
      </TabsContent>

      <TabsContent value="import" className="mt-0">
        <ImportSettings />
      </TabsContent>

      <TabsContent value="audit-log" className="mt-0">
        <AuditLogSettings />
      </TabsContent>
    </Tabs>
  )
}
