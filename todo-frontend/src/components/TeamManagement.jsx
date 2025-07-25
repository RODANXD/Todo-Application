import React, { useEffect, useState } from 'react';
import { inviteTeamMember, updateMemberRole, removeMember,getTaskStats, getProjectMembers,getOrganization, directprojectinvite, getAllEmails } from '../api/AxiosAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from "sonner";
import { X, Mail, UserPlus, Users, Crown, Trash2, Shield } from 'lucide-react';
import {  DropdownMenu,  DropdownMenuContent, DropdownMenuSeparator,  DropdownMenuItem,  DropdownMenuTrigger,} from "../components/ui/dropdown-menu"


const TeamManagement = ({ project, onClose }) => {
    const [members, setMembers] = useState([]);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [directEmail, setDirectEmail] = useState('');
    const [directRole, setDirectRole] = useState('member');
    const [getemails, setgetemails] = useState([]);

    useEffect(() => {
        if (project && project.id) {
            fetchMembers();
        }
    }, [project?.id]);


     useEffect(()=>{
    const fetchEmails = async () => {
        try {
            const response = await getAllEmails();
            console.log('Fetched emails:', response.data);
            setgetemails(response.data);
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        }
    }
    fetchEmails();
},[])   


    const fetchMembers = async () => {
        if (!project || !project.id) return;
        try {
            const response = await getProjectMembers(project.id);

            setMembers(response.data);
            console.log('Fetched members:', response.data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const orgRes = await getOrganization();
            const orgResults = orgRes.data?.results;

            if (!orgResults || orgResults.length === 0) {
              throw new Error("Organization not found");
            }

            const orgId = orgResults[0].id;
            await inviteTeamMember(orgId, { email, role });
            setEmail('');
            setRole('member');
            toast.success("Invite sent successfully");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite team member');
            setError(error.response?.data?.message || 'Failed to invite team member');
        } finally {
            setLoading(false);
        }
    };

    const directInvite = async (e) => {
        e.preventDefault();
        setLoadingMembers(true);
        setError(null);
        
        try {
            await directprojectinvite(project.id, { email: directEmail, role: directRole });
            console.log('Invited team member:', directEmail, 'with role:', directRole);
            setDirectEmail('');
            setDirectRole('member');
            toast.success("Direct invite sent successfully");
            onClose();
        } catch (error) {
            
            toast.error("Member is already added");
            setError(error.response?.data?.message || 'Failed to invite team member');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await updateMemberRole(project.id, memberId, newRole);
            await fetchMembers();
            onClose();
            toast.success("Role updated successfully");
        } catch (error) {
            toast.error("Failed to update role");
            setError(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            await removeMember(project.id, memberId);
            await fetchMembers();
            onClose();
            toast.success("Member removed successfully");
        } catch (error) {
            console.error("Remove error:", error);
            toast.error("Failed to remove member");
            setError(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const getRoleIcon = (role) => {
        return role === 'admin' ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
    };

    const getRoleBadgeVariant = (role) => {
        return role === 'admin' ? 'default' : 'secondary';
    };

    const getUserInitials = (user) => {
        if (user?.username) {
            return user.username.substring(0, 2).toUpperCase();
        }
        if (user?.first_name) {
            return user.first_name.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Team Management</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Manage your project team members</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Invite Forms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Email Invite */}
            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700 text-base sm:text-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  Invite via Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="bg-gray-50 border-gray-200 focus:border-blue-400 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex-1 border border-gray-200 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 w-full sm:w-auto"
                    >
                      {loading ? 'Inviting...' : 'Send Invite'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Direct Invite */}
            <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-purple-700 text-base sm:text-lg">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Direct Invite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={directInvite} className="space-y-3 sm:space-y-4">
                  <div className="flex gap-2 sm:gap-4">
                    <select
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      className="flex-1 border p-2 rounded bg-slate-200 text-black text-sm sm:text-base"
                      required
                    >
                      <option value="">Select email</option>
                      {getemails.map((email, idx) => (
                        <option key={idx} value={email}>{email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select
                      value={directRole}
                      onChange={(e) => setDirectRole(e.target.value)}
                      className="flex-1 border border-gray-200 p-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm sm:text-base"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      type="submit"
                      disabled={loadingMembers}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 sm:px-6 w-full sm:w-auto"
                    >
                      {loadingMembers ? 'Inviting...' : 'Direct Invite'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Team Members */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Current Team Members</h3>
              <Badge variant="secondary" className="ml-2">
                {members.length}
              </Badge>
            </div>

            <Card className="border-gray-200">
              <ScrollArea className="h-40 sm:h-44">
                <div className="p-3 sm:p-4 space-y-3">
                  {members.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base">No team members yet</p>
                      <p className="text-xs sm:text-sm">Invite your first team member above</p>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.user.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm sm:text-base">
                              {getUserInitials(member.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                              {member.user?.username || member.first_name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                          <Badge
                            variant={getRoleBadgeVariant(member.role)}
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            {getRoleIcon(member.role)}
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                            disabled={project?.owner?.id && member.id === project.owner.id}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          {(!project?.owner?.id || member.id !== project.owner.id) && (
                            <Button
                              onClick={() => handleRemoveMember(member.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
    );
};

export default TeamManagement;
