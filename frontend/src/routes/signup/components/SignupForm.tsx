import { cn } from "@shadcn-ui/lib/utils";
import { Button } from "@shadcn-ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shadcn-ui/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@shadcn-ui/components/ui/field";
import { Input } from "@shadcn-ui/components/ui/input";
import { ComponentProps, useRef, useState } from "react";
import { Link } from "react-router";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@shadcn-ui/components/ui/input-group";
import { AtSign, EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "../../../providers/auth";

export function SignupForm({ className, ...props }: ComponentProps<"div">) {
  const [isShowingPassword, setIsShowingPassword] = useState<boolean>(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const { signup } = useAuth();

  const signupHandler = () => {
    const email = emailInputRef.current?.value;
    const username = usernameInputRef.current?.value;
    const name = nameInputRef.current?.value;
    const password = passwordInputRef.current?.value;

    if (!email || !username || !name || !password) return;

    signup({
      email,
      username,
      name,
      password,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder="johndoe@mail.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    ref={usernameInputRef}
                    id="username"
                    type="username"
                    placeholder="JohnDoe"
                    required
                  />
                  <InputGroupAddon>
                    <AtSign />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    ref={passwordInputRef}
                    id="password"
                    type={isShowingPassword ? "text" : "password"}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setIsShowingPassword((prevState) => !prevState)
                      }
                      className="text-muted-foreground focus-visible:ring-ring/50 cursor-pointer hover:bg-transparent"
                    >
                      {isShowingPassword ? <EyeOffIcon /> : <EyeIcon />}
                      <span className="sr-only">
                        {isShowingPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field>
                <Button onClick={signupHandler}>Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Log in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
