// resources/js/Components/ApplicationInformation.tsx

import { useState } from 'react';
import { Application } from '@/types/dashboard';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Calendar, 
  User, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Paperclip,
  ExternalLink,
  Archive,
  StickyNote,
  Target,
  FileCheck,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface Props {
    applications: Application[];
    selectedUnitId: number | null;
}

export default function ApplicationInformation({ applications, selectedUnitId }: Props) {
    const [openApplications, setOpenApplications] = useState<{ [key: number]: boolean }>({});

    const toggleApplication = (applicationId: number) => {
        setOpenApplications(prev => ({
            ...prev,
            [applicationId]: !prev[applicationId]
        }));
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'approved' || lowerStatus === 'accepted') {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'pending' || lowerStatus === 'submitted') {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (lowerStatus === 'under review' || lowerStatus === 'reviewing') {
            return <Eye className="h-4 w-4 text-blue-600" />;
        } else if (lowerStatus === 'rejected' || lowerStatus === 'denied' || lowerStatus === 'declined') {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'approved' || lowerStatus === 'accepted') {
            return "default";
        } else if (lowerStatus === 'pending' || lowerStatus === 'submitted') {
            return "outline";
        } else if (lowerStatus === 'under review' || lowerStatus === 'reviewing') {
            return "secondary";
        } else if (lowerStatus === 'rejected' || lowerStatus === 'denied' || lowerStatus === 'declined') {
            return "destructive";
        }
        return "secondary";
    };

    const getStageIcon = (stage: string | null | undefined) => {
        if (!stage) return <Target className="h-4 w-4 text-gray-400" />;
        
        const lowerStage = stage.toLowerCase();
        if (lowerStage.includes('background') || lowerStage.includes('check')) {
            return <UserCheck className="h-4 w-4 text-purple-600" />;
        } else if (lowerStage.includes('document') || lowerStage.includes('paperwork')) {
            return <FileCheck className="h-4 w-4 text-blue-600" />;
        } else if (lowerStage.includes('review') || lowerStage.includes('verification')) {
            return <Eye className="h-4 w-4 text-orange-600" />;
        }
        return <Target className="h-4 w-4 text-indigo-600" />;
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Applications</CardTitle>
                        <CardDescription>
                            Rental applications and applicant information for {applications.length} application{applications.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {applications.length === 0 && (
                        <Badge variant="secondary" className="px-4 py-2">
                            No applications found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {applications.length > 0 && (
                <CardContent className="space-y-4">
                    {applications.map((application) => (
                        <Collapsible
                            key={application.id}
                            open={openApplications[application.id]}
                            onOpenChange={() => toggleApplication(application.id)}
                        >
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full p-0 h-auto hover:bg-transparent"
                                    >
                                        <CardHeader className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 rounded-full bg-indigo-100">
                                                        <FileText className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <CardTitle className="text-xl">
                                                            {application.name || 'Unknown Applicant'}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center space-x-4">
                                                            {application.date_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-1" />
                                                                    Applied: {application.date_formatted}
                                                                </span>
                                                            )}
                                                            {application.co_signer && (
                                                                <span className="flex items-center">
                                                                    <Users className="h-4 w-4 mr-1" />
                                                                    Co-signer: {application.co_signer}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <Badge 
                                                            variant={application.is_archived ? "destructive" : "default"}
                                                            className="px-3 py-1"
                                                        >
                                                            {application.is_archived ? 'Archived' : 'Active'}
                                                        </Badge>
                                                        {application.status && (
                                                            <div className="flex items-center space-x-1">
                                                                {getStatusIcon(application.status)}
                                                                <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                                                                    {application.status}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {application.has_attachment && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Paperclip className="h-3 w-3 mr-1" />
                                                                Attachment
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {openApplications[application.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <Separator className="mb-6" />
                                        
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {/* Applicant Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Applicant Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Applicant Name
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {application.name || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Users className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Co-Signer
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-purple-900">
                                                                {application.co_signer || 'None'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Target className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Application Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(application.status)}
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {application.status || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Application Details */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <FileText className="h-5 w-5 text-green-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Application Details
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Application Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-green-900">
                                                                {application.date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    {application.stage_in_progress && (
                                                        <Card className="bg-orange-50 border-orange-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    {getStageIcon(application.stage_in_progress)}
                                                                    <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                        Current Stage
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-orange-900">
                                                                    {application.stage_in_progress}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {application.has_attachment && (
                                                        <Card className="bg-indigo-50 border-indigo-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Paperclip className="h-4 w-4 text-indigo-600" />
                                                                    <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                        Attachment
                                                                    </label>
                                                                </div>
                                                                <div className="mt-2">
                                                                    {application.attachment_url ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 px-3"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                window.open(application.attachment_url, '_blank');
                                                                            }}
                                                                        >
                                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                                            {application.attachment_name || 'View Attachment'}
                                                                        </Button>
                                                                    ) : (
                                                                        <Badge variant="secondary">
                                                                            <Paperclip className="h-3 w-3 mr-1" />
                                                                            Attachment Available
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Record Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Archive className="h-5 w-5 text-slate-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Record Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Application ID
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                #{application.id}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-gray-50 border-gray-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Archive className="h-4 w-4 text-gray-600" />
                                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                                    Archived Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {application.is_archived ? (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {application.is_archived ? 'Archived' : 'Active'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Status Summary Card */}
                                                    <Card className={`${
                                                        application.status?.toLowerCase() === 'approved' ? 'bg-green-50 border-green-200' :
                                                        application.status?.toLowerCase() === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                                                        application.status?.toLowerCase() === 'rejected' ? 'bg-red-50 border-red-200' :
                                                        'bg-blue-50 border-blue-200'
                                                    }`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getStatusIcon(application.status)}
                                                                <label className={`text-xs font-semibold uppercase tracking-wide ${
                                                                    application.status?.toLowerCase() === 'approved' ? 'text-green-700' :
                                                                    application.status?.toLowerCase() === 'pending' ? 'text-yellow-700' :
                                                                    application.status?.toLowerCase() === 'rejected' ? 'text-red-700' :
                                                                    'text-blue-700'
                                                                }`}>
                                                                    Application Status
                                                                </label>
                                                            </div>
                                                            <Badge 
                                                                variant={getStatusBadgeVariant(application.status)}
                                                                className="font-semibold"
                                                            >
                                                                {application.status || 'Status Unknown'}
                                                            </Badge>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {application.notes && (
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <StickyNote className="h-5 w-5 text-amber-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Application Notes
                                                    </h4>
                                                </div>
                                                <Card className="bg-amber-50 border-amber-200">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm text-amber-900 whitespace-pre-wrap">
                                                            {application.notes}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}
