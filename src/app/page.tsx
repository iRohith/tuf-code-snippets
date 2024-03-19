"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import useSessionStorage from "@/components/use-session-storage";
import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const zLanguage = z.enum(["cpp", "java", "javascript", "python"]);
type Language = z.infer<typeof zLanguage>;
const formSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^(?![-.])[a-zA-Z0-9._-]+(?<![-.])$/),
  language: zLanguage,
  stdin: z.string(),
  code: z.string(),
});

const defaultCode = {
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}
`,
  java: `class Program {
  public static void main(String[] args) {
      System.out.println("Hello World!"); 
  }
}
`,
  javascript: `console.log('Hello World!');`,
  python: `print("Hello World!")`,
};

export default function Home() {
  const { theme } = useTheme();
  const [cppCode, setCppCode] = useSessionStorage("cpp", defaultCode.cpp);
  const [javaCode, setJavaCode] = useSessionStorage("java", defaultCode.java);
  const [jsCode, setJsCode] = useSessionStorage("js", defaultCode.javascript);
  const [pyCode, setPyCode] = useSessionStorage("py", defaultCode.python);
  const [initialValues] = useSessionStorage("formValues", {
    username: "",
    code: defaultCode.cpp,
    language: "cpp" as Language,
    stdin: "",
  });

  const getCode = () => {
    const lang = form.getValues().language;
    if (lang == "java") return javaCode;
    if (lang == "python") return pyCode;
    if (lang == "javascript") return jsCode;
    return cppCode;
  };

  const setCode = (code: string) => {
    const lang = form.getValues().language;
    if (lang == "java") setJavaCode(code);
    else if (lang == "python") setPyCode(code);
    else if (lang == "javascript") setJsCode(code);
    else setCppCode(code);
    form.setValue("code", code);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const formValues = form.watch();

  useEffect(() => {
    sessionStorage.setItem("formValues", JSON.stringify(formValues));
  }, [formValues]);

  const { toast } = useToast();
  const [canSubmit, setCanSubmit] = useState(true);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canSubmit) return;
    setCanSubmit(false);
    toast({
      title: "Submitting...",
    });
    const response = await (
      await fetch(`https://tufcs-backend.onrender.com/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
    ).json();

    if (response["success"] === true) {
      toast({
        title: "Submitted",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Submission failed",
      });
    }
    setCanSubmit(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div className="relative flex flex-row mt-5 mx-5 gap-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            defaultValue="cpp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Select
                    defaultValue="cpp"
                    value={field.value}
                    onValueChange={(v) => {
                      form.setValue("language", v as Language);
                      setCode(getCode());
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-8">
            Submit
          </Button>
        </div>
        <div className="mx-5 mt-5">
          <FormField
            control={form.control}
            defaultValue=""
            name="stdin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>STDIN</FormLabel>
                <FormControl>
                  <Textarea placeholder="stdin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mx-5 mt-5">
          <FormField
            control={form.control}
            defaultValue={defaultCode["cpp"]}
            name="code"
            render={() => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Editor
                    className="border"
                    height="60vh"
                    defaultLanguage={initialValues.language}
                    defaultValue={defaultCode["cpp"]}
                    language={form.getValues().language}
                    theme={theme === "light" ? "light" : "vs-dark"}
                    value={getCode()}
                    onChange={(v) => setCode(v ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
