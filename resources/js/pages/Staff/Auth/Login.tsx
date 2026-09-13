import BrandedAuthShell from '@/components/branded-auth-shell';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Lock, UserRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/staff/login', { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Staff Login" />
            <BrandedAuthShell
                variant="staff-login"
                title="Welcome back"
                description="Sign in to access your branch workspace."
            >
                <form onSubmit={submit} className="space-y-5">
                    {status && (
                        <Alert className="border-[#008c45]/20 bg-[#008c45]/5 text-[#075238]">
                            <AlertDescription>{status}</AlertDescription>
                        </Alert>
                    )}
                    {errors.username && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>
                                {errors.username}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label
                            htmlFor="username"
                            className="text-sm font-medium"
                        >
                            Username
                        </Label>
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#82908b]" />
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(event) =>
                                    setData('username', event.target.value)
                                }
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                                autoFocus
                                aria-invalid={!!errors.username}
                                className="h-12 rounded-xl border-[#dce3df] bg-[#fbfcfb] pr-4 pl-11 shadow-none focus-visible:border-[#008c45] focus-visible:ring-[#008c45]/15"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#82908b]" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="h-12 rounded-xl border-[#dce3df] bg-[#fbfcfb] pr-12 pl-11 shadow-none focus-visible:border-[#008c45] focus-visible:ring-[#008c45]/15"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#71807a] transition-colors hover:bg-[#eef3f0] hover:text-[#173e31]"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="size-[18px]" />
                                ) : (
                                    <Eye className="size-[18px]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-12 w-full rounded-xl bg-[#008c45] text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,140,69,0.18)] hover:bg-[#08783f]"
                    >
                        {processing ? 'Signing in…' : 'Sign in'}
                    </Button>

                    <p className="text-center text-xs leading-5 text-[#71807a]">
                        Staff access is managed by your business administrator.
                    </p>
                </form>
            </BrandedAuthShell>
        </>
    );
}
