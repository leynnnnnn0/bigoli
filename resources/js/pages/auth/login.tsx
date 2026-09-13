import BrandedAuthShell from '@/components/branded-auth-shell';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    isDemo: boolean;
}

export default function Login({ status, isDemo }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Business Login" />
            <BrandedAuthShell
                variant="business-login"
                title="Welcome back"
                description="Sign in to manage your loyalty program and branches."
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            {status && (
                                <Alert className="border-[#008c45]/20 bg-[#008c45]/5 text-[#075238]">
                                    <AlertDescription>
                                        {status}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#82908b]" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={
                                            isDemo ? 'business@gmail.com' : ''
                                        }
                                        placeholder="business@example.com"
                                        autoComplete="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        aria-invalid={!!errors.email}
                                        className="h-12 rounded-xl border-[#dce3df] bg-[#fbfcfb] pr-4 pl-11 shadow-none focus-visible:border-[#008c45] focus-visible:ring-[#008c45]/15"
                                    />
                                </div>
                                <InputError message={errors.email} />
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
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        defaultValue={isDemo ? 'password' : ''}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        tabIndex={2}
                                        aria-invalid={!!errors.password}
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
                                        tabIndex={3}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-[18px]" />
                                        ) : (
                                            <Eye className="size-[18px]" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={4}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-normal text-[#52615b]"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                tabIndex={5}
                                data-test="login-button"
                                className="h-12 w-full rounded-xl bg-[#008c45] text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,140,69,0.18)] hover:bg-[#08783f]"
                            >
                                {processing && <Spinner />}
                                {processing ? 'Signing in…' : 'Sign in'}
                            </Button>

                            <p className="text-center text-xs leading-5 text-[#71807a]">
                                Secure access for Bigoli business
                                administrators.
                            </p>
                        </>
                    )}
                </Form>
            </BrandedAuthShell>
        </>
    );
}
