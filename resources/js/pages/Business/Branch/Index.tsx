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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Head, router, useForm, usePage } from '@inertiajs/react';

interface Branch {
    id: number;
    name: string;
    address: string;
    remarks?: string;
}

interface Props {
    branches: Branch[];
    filters: {
        search?: string;
    };
}



export default function Index({ branches, filters }: Props) {

    const { props } = usePage<{
        flash?: { error?: string; success?: string };
    }>();

    useEffect(() => {
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);
    const [search, setSearch] = useState(filters?.search ?? '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                '/business/branches',
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const form = useForm({
        name: '',
        address: '',
        remarks: '',
    });

    const openCreateDialog = () => {
        setEditingBranch(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    };

    const openEditDialog = (branch: Branch) => {
        setEditingBranch(branch);
        form.setData({
            name: branch.name,
            address: branch.address,
            remarks: branch.remarks ?? '',
        });
        form.clearErrors();
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (editingBranch) {
            form.put(`/business/branches/${editingBranch.id}`, {
                onSuccess: () => {
                    toast.success('Branch updated successfully');
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => {
                    toast.error('Failed to update branch');
                },
            });
        } else {
            form.post('/business/branches', {
                onSuccess: () => {
                    toast.success('Branch created successfully');
                    setDialogOpen(false);
                    form.reset();
                },
                onError: () => {
                    toast.error('Failed to create branch');
                },
            });
        }
    };

   const handleDelete = () => {
       if (!deleteConfirm) return;

       form.delete(`/business/branches/${deleteConfirm.id}`, {
           onSuccess: () => {
               if (props.flash?.error) {
                  toast.error(props.flash.error);
               } else {
                    toast.success('Branch deleted successfully');
                }
     
               
               setDeleteConfirm(null);
           },
       });
   };

    return (
        <AppLayout>
            <Head title="Branches" />
            <ModuleHeading
                title="Branches"
                description="Manage the branch locations of your business"
            >
                <Button onClick={openCreateDialog}>
                    <Plus />
                    Create New
                </Button>
            </ModuleHeading>

            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search branches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Name
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell">
                                    Address
                                </th>
                                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:table-cell">
                                    Remarks
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {branches?.map((branch) => (
                                <tr
                                    key={branch.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {branch.name}
                                    </td>
                                    <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                                        {branch.address || '-'}
                                    </td>
                                    <td className="hidden px-4 py-3 text-sm text-gray-500 lg:table-cell">
                                        {branch.remarks || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(branch)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteConfirm(branch)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {branches?.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                    >
                                        No branches found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBranch
                                ? 'Edit Branch'
                                : 'Create New Branch'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Enter branch name"
                            />
                            {form.errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={form.data.address}
                                onChange={(e) =>
                                    form.setData('address', e.target.value)
                                }
                                placeholder="Enter branch address"
                                rows={3}
                            />
                            {form.errors.address && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.address}
                                </p>
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
                                placeholder="Enter remarks (optional)"
                                rows={3}
                            />
                            {form.errors.remarks && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.remarks}
                                </p>
                            )}
                        </div>

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
                                    : editingBranch
                                      ? 'Update Branch'
                                      : 'Create Branch'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteConfirm}
                onOpenChange={() => setDeleteConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deleteConfirm?.name}</strong>? This action
                            cannot be undone.
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
