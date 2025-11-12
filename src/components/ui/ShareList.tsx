import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

const ShareList = ({ open, onOpenChange, listId }: ShareListProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  // Mock shared members - Firebase'den gelecek
  const members = [
    { id: "1", name: "Sophia Clark", email: "sophia@email.com", role: "owner" },
    { id: "2", name: "Ethan Miller", email: "ethan@email.com", role: "viewer" },
  ];

  const shareLink = `https://smartmarket.app/list/${listId}`;

  const handleInviteByEmail = async () => {
    if (!email.trim()) return;

    // Firebase'e davetiye gönderilecek
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${email}`,
    });
    setEmail("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invite to List</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invite by Email */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInviteByEmail()}
                className="flex-1"
              />
              <Button onClick={handleInviteByEmail} size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Invite by Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Manage Permissions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Manage Permissions</Label>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role === 'owner' ? 'Owner' : 'Can view'}
                    </p>
                  </div>
                  <Select defaultValue={member.role} disabled={member.role === 'owner'}>
                    <SelectTrigger className="w-28 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="editor">Can edit</SelectItem>
                      <SelectItem value="viewer">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full h-11 font-semibold">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareList;