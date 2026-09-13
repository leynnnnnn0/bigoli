import CustomerAuthShell from '@/components/customer-auth-shell';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginProps {
    business?: { id: number; name: string; logo?: string };
    status?: string;
    isDemo: boolean;
}

export default function Login({ business, status, isDemo }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: isDemo ? 'customer@gmail.com' : '',
        password: isDemo ? 'password' : '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/customer/login', { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Customer Login" />
            <CustomerAuthShell
                mode="login"
                title="Welcome back"
                description={
                    business ? (
                        <>
                            Sign in to continue earning rewards at{' '}
                            <strong className="font-semibold text-[#173e31]">
                                {business.name}
                            </strong>
                            .
                        </>
                    ) : (
                        'Sign in to view your stamps and rewards.'
                    )
                }
                businessLogo={business?.logo}
                businessName={business?.name}
            >
                <form onSubmit={submit} className="space-y-5">
                    {status && (
                        <Alert className="border-[#008c45]/20 bg-[#008c45]/5 text-[#075238]">
                            <AlertDescription>{status}</AlertDescription>
                        </Alert>
                    )}
                    {errors.email && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>{errors.email}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#82908b]" />
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                placeholder="customer@example.com"
                                autoComplete="email"
                                required
                                autoFocus
                                aria-invalid={!!errors.email}
                                className="h-12 rounded-xl border-[#dce3df] bg-[#fbfcfb] pr-4 pl-11 shadow-none focus-visible:border-[#008c45] focus-visible:ring-[#008c45]/15"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </Label>
                            <Link
                                href="/customer/forgot-password"
                                className="text-xs font-semibold text-[#008c45] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
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

                    <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-[#52615b]">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) =>
                                setData('remember', event.target.checked)
                            }
                            className="size-4 rounded border-[#bcc8c3] accent-[#008c45]"
                        />
                        Remember me
                    </label>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-12 w-full rounded-xl bg-[#008c45] text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,140,69,0.18)] hover:bg-[#08783f]"
                    >
                        {processing ? 'Signing in…' : 'Sign in'}
                    </Button>

                    <p className="text-center text-sm text-[#64736d]">
                        New to Bigoli Rewards?{' '}
                        <Link
                            href="/customer/register"
                            className="font-semibold text-[#008c45] hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </form>
            </CustomerAuthShell>
        </>
    );
}
