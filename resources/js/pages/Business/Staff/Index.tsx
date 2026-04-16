import ModuleHeading from '@/components/module-heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Branch {
    id: number;
    name: string;
}

interface Staff {
    id: number;
    branch_id: number;
    branch_relation: Branch | null; // eager loaded
    username: string;
    remarks?: string;
    is_active: boolean;
}

interface Props {
    staffs: Staff[];
    branches: Branch[];
    filters: {
        search?: string;
    };
}

export default function Index({ staffs, branches, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                '/business/staffs',
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const form = useForm({
        branch_id: '',
        username: '',
        password: '',
        confirm_password: '',
        remarks: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingStaff(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (staff: Staff) => {
        setEditingStaff(staff);
        form.setData({
            branch_id: String(staff.branch_id),
            username: staff.username,
            password: '',
            confirm_password: '',
            remarks: staff.remarks || '',
            is_active: staff.is_active,
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (editingStaff) {
            form.put(`/business/staffs/${editingStaff.id}`, {
                onSuccess: () => {
                    toast.success('Staff updated successfully');
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => toast.error('Failed to update staff'),
            });
        } else {
            form.post('/business/staffs', {
                onSuccess: () => {
                    toast.success('Staff created successfully');
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => toast.error('Failed to create staff'),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteConfirm) return;
        form.delete(`/business/staffs/${deleteConfirm.id}`, {
            onSuccess: () => {
                toast.success('Staff deleted successfully');
                setDeleteConfirm(null);
            },
            onError: () => toast.error('Failed to delete staff'),
        });
    };

    return (
        <AppLayout>
            <Head title="Staff" />
            <ModuleHeading
                title="Staff"
                description="Manage the staff accounts of your business"
            >
                <Button onClick={openCreateDialog}>
                    <Plus />
                    Create New
                </Button>
            </ModuleHeading>

            {/* Search */}
            <div className="relative mb-4 max-w-sm">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Branch
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Username
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell">
                                    Remarks
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {staffs?.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {staff.branch_relation?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {staff.username}
                                    </td>
                                    <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                                        {staff.remarks || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                staff.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {staff.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(staff)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingStaff ? 'Edit Staff' : 'Create New Staff'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Branch Dropdown */}
                        <div>
                            <Label htmlFor="branch_id">Branch</Label>
                            <Select
                                value={form.data.branch_id}
                                onValueChange={(val) =>
                                    form.setData('branch_id', val)
                                }
                            >
                                <SelectTrigger id="branch_id">
                                    <SelectValue placeholder="Select a branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={String(branch.id)}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.branch_id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.branch_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={form.data.username}
                                onChange={(e) =>
                                    form.setData('username', e.target.value)
                                }
                                placeholder="Enter username"
                            />
                            {form.errors.username && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.username}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData('password', e.target.value)
                                    }
                                    placeholder={
                                        editingStaff
                                            ? 'Leave blank to keep current'
                                            : 'Enter password'
                                    }
                                />
                                {form.errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>

                            {!editingStaff && (
                                <div>
                                    <Label htmlFor="confirm_password">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={form.data.confirm_password}
                                        onChange={(e) =>
                                            form.setData(
                                                'confirm_password',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm password"
                                    />
                                    {form.errors.confirm_password && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.confirm_password}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(e) =>
                                    form.setData('remarks', e.target.value)
                                }
                                placeholder="Enter remarks"
                                rows={3}
                            />
                            {form.errors.remarks && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.remarks}
                                </p>
                            )}
                        </div>

                        {editingStaff && (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_active', checked)
                                    }
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : editingStaff
                                      ? 'Update Staff'
                                      : 'Create Staff'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteConfirm}
                onOpenChange={() => setDeleteConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Staff</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteConfirm?.username}</strong>? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
