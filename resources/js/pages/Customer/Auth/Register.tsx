import BrandedAuthShell from '@/components/branded-auth-shell';
import TermsAndAgreement from '@/components/TermsAndAgreement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Phone,
    User,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Business {
    id: number;
    name: string;
    logo?: string;
}
interface Branch {
    id: number;
    name: string;
}
interface RegisterProps {
    business: Business;
    branches: Branch[];
    branch_id: number | null;
}

const inputClassName =
    'h-12 rounded-xl border-[#dce3df] bg-[#fbfcfb] px-3 shadow-none min-[420px]:pr-4 min-[420px]:pl-10 focus-visible:border-[#008c45] focus-visible:ring-[#008c45]/15';

const inputIconClassName =
    'pointer-events-none absolute top-1/2 left-3 hidden size-4 -translate-y-1/2 text-[#82908b] min-[420px]:block';

export default function Register({
    business,
    branches,
    branch_id,
}: RegisterProps) {
    const [showPasswords, setShowPasswords] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        date_of_birth: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        branch_id: branch_id?.toString() ?? '',
        terms: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/customer/register', {
            onSuccess: () => {
                toast.success(
                    'Registration successful! You can now start earning stamps.',
                );
                reset('password', 'password_confirmation');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Customer Registration" />
            <BrandedAuthShell
                variant="customer-register"
                title="Create your account"
                description={
                    <>
                        Join{' '}
                        <strong className="font-semibold text-[#173e31]">
                            {business.name}
                        </strong>{' '}
                        and start collecting rewards today.
                    </>
                }
                businessLogo={business.logo}
                businessName={business.name}
            >
                <form onSubmit={submit} className="space-y-5">
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>
                                Please review the highlighted fields below.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label
                            htmlFor="branch_id"
                            className="text-sm font-medium"
                        >
                            Preferred branch
                        </Label>
                        <Select
                            value={data.branch_id}
                            onValueChange={(value) =>
                                setData('branch_id', value)
                            }
                        >
                            <SelectTrigger
                                id="branch_id"
                                className="h-12 w-full rounded-xl border-[#dce3df] bg-[#fbfcfb] px-4 text-sm shadow-none focus:border-[#008c45] focus:ring-[#008c45]/15"
                                aria-invalid={!!errors.branch_id}
                            >
                                <SelectValue placeholder="Choose a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem
                                        key={branch.id}
                                        value={branch.id.toString()}
                                    >
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.branch_id && (
                            <FieldError>{errors.branch_id}</FieldError>
                        )}
                        {branches.length === 0 && (
                            <p className="text-xs text-[#64736d]">
                                No branches are available for registration yet.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-5">
                        <div className="min-w-0 space-y-2">
                            <Label
                                htmlFor="username"
                                className="text-sm font-medium"
                            >
                                Username
                            </Label>
                            <div className="relative">
                                <User className={inputIconClassName} />
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(event) =>
                                        setData('username', event.target.value)
                                    }
                                    placeholder="e.g. juan"
                                    autoComplete="username"
                                    required
                                    aria-invalid={!!errors.username}
                                    className={inputClassName}
                                />
                            </div>
                            {errors.username && (
                                <FieldError>{errors.username}</FieldError>
                            )}
                        </div>

                        <div className="min-w-0 space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email address
                            </Label>
                            <div className="relative">
                                <Mail className={inputIconClassName} />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    placeholder="you@email.ph"
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    className={inputClassName}
                                />
                            </div>
                            {errors.email && (
                                <FieldError>{errors.email}</FieldError>
                            )}
                        </div>

                        <div className="min-w-0 space-y-2">
                            <Label
                                htmlFor="date_of_birth"
                                className="text-sm font-medium"
                            >
                                Date of birth
                            </Label>
                            <div className="relative">
                                <CalendarDays className={inputIconClassName} />
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(event) =>
                                        setData(
                                            'date_of_birth',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="bday"
                                    required
                                    aria-invalid={!!errors.date_of_birth}
                                    className={inputClassName}
                                />
                            </div>
                            {errors.date_of_birth && (
                                <FieldError>{errors.date_of_birth}</FieldError>
                            )}
                        </div>

                        <div className="min-w-0 space-y-2">
                            <Label
                                htmlFor="phone_number"
                                className="text-sm font-medium"
                            >
                                Phone number
                            </Label>
                            <div className="relative">
                                <Phone className={inputIconClassName} />
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    value={data.phone_number}
                                    onChange={(event) =>
                                        setData(
                                            'phone_number',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="09XX XXX XXXX"
                                    autoComplete="tel"
                                    required
                                    aria-invalid={!!errors.phone_number}
                                    className={inputClassName}
                                />
                            </div>
                            {errors.phone_number && (
                                <FieldError>{errors.phone_number}</FieldError>
                            )}
                        </div>

                        <PasswordField
                            id="password"
                            label="Password"
                            value={data.password}
                            show={showPasswords}
                            error={errors.password}
                            placeholder="8+ chars"
                            onChange={(value) => setData('password', value)}
                            onToggle={() => setShowPasswords((value) => !value)}
                        />
                        <PasswordField
                            id="password_confirmation"
                            label="Confirm password"
                            value={data.password_confirmation}
                            show={showPasswords}
                            placeholder="Repeat"
                            onChange={(value) =>
                                setData('password_confirmation', value)
                            }
                            onToggle={() => setShowPasswords((value) => !value)}
                        />
                    </div>

                    <div className="rounded-xl border border-[#dce3df] bg-[#fbfcfb] p-4">
                        <TermsAndAgreement
                            checked={data.terms}
                            onCheckedChange={(value) => setData('terms', value)}
                            error={errors.terms}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || !data.terms || !data.branch_id}
                        className="h-12 w-full rounded-xl bg-[#008c45] text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,140,69,0.18)] hover:bg-[#08783f]"
                    >
                        {processing ? 'Creating account…' : 'Create account'}
                    </Button>

                    <p className="text-center text-sm text-[#64736d]">
                        Already have an account?{' '}
                        <Link
                            href="/customer/login"
                            className="font-semibold text-[#008c45] hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </BrandedAuthShell>
        </>
    );
}

function FieldError({ children }: { children: string }) {
    return <p className="text-xs text-destructive">{children}</p>;
}

function PasswordField({
    id,
    label,
    value,
    show,
    error,
    placeholder,
    onChange,
    onToggle,
}: {
    id: string;
    label: string;
    value: string;
    show: boolean;
    error?: string;
    placeholder: string;
    onChange: (value: string) => void;
    onToggle: () => void;
}) {
    return (
        <div className="min-w-0 space-y-2">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <div className="relative">
                <Lock className={inputIconClassName} />
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    required
                    aria-invalid={!!error}
                    className={`${inputClassName} pr-11`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#71807a] transition-colors hover:bg-[#eef3f0] hover:text-[#173e31] min-[420px]:right-2"
                    aria-label={show ? 'Hide passwords' : 'Show passwords'}
                >
                    {show ? (
                        <EyeOff className="size-[17px]" />
                    ) : (
                        <Eye className="size-[17px]" />
                    )}
                </button>
            </div>
            {error && <FieldError>{error}</FieldError>}
        </div>
    );
}
