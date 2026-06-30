'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { updateNotificationPrefsAction } from '@/app/actions/profile'

export function AccountNotifications({
  news: initialNews,
  reminders: initialReminders,
  emailEnabled,
}: {
  news: boolean
  reminders: boolean
  /** Si el envío de email (Resend) está configurado en el servidor. */
  emailEnabled: boolean
}) {
  const [news, setNews] = useState(initialNews)
  const [reminders, setReminders] = useState(initialReminders)
  const [, startTransition] = useTransition()

  function save(next: { news: boolean; reminders: boolean }) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('notify_news', String(next.news))
      fd.append('notify_course_reminders', String(next.reminders))
      const res = await updateNotificationPrefsAction(null, fd)
      if (res?.error) toast.error(res.error)
      else toast.success('Preferencias guardadas')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4 text-primary" /> Notificaciones por email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {!emailEnabled && (
          <p className="mb-3 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            El envío de emails aún no está activado en el centro. Puedes elegir tus preferencias y se
            respetarán en cuanto se active.
          </p>
        )}

        <Row
          title="Novedades del centro"
          desc="Nuevos cursos, eventos y anuncios."
          checked={news}
          onChange={(v) => {
            setNews(v)
            save({ news: v, reminders })
          }}
        />
        <div className="h-px bg-border my-1" />
        <Row
          title="Recordatorios de tus cursos"
          desc="Avisos para retomar un curso que dejaste a medias."
          checked={reminders}
          onChange={(v) => {
            setReminders(v)
            save({ news, reminders: v })
          }}
        />
      </CardContent>
    </Card>
  )
}

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}
