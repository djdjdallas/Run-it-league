import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function AnnouncementCard({ announcement }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{announcement.title}</CardTitle>
          {announcement.is_pinned && (
            <Badge variant="secondary" className="ml-2">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(announcement.created_at)}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
      </CardContent>
    </Card>
  )
}
