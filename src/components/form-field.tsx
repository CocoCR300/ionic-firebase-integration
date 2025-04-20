import { IonInput } from "@ionic/react";
import { ReactNode, useEffect, useState } from "react";

type SetterFn = (text: string, valid: boolean) => void;
type ValidatorFn = (text: string) => string | Promise<string>;

interface FormTextFieldData
{
	children?: ReactNode;
	label: string;
	fieldType?: string;
	changed: SetterFn;
	validate: ValidatorFn;

	ref?: any;
}

export function FormTextField(data: FormTextFieldData)
{
	const [errorMessage, setErrorMessage] = useState("");
	const [text, setText] = useState("");
	const [touched, setTouched] = useState(false);
	const [valid, setValid] = useState(false);

	let abort: AbortController | null = null;

	async function validate(abortSignal: AbortSignal) {
		const maybePromise = data.validate(text);
		let errorMessage: string;
		if (typeof(maybePromise) == "string") {
			errorMessage = maybePromise;
		}
		else {
			errorMessage = await maybePromise;
		}

		if (abortSignal.aborted) {
			return;
		}

		const valid = errorMessage == "";

		setValid(valid);
		setErrorMessage(errorMessage);

		data.changed(text, valid);
	}

	useEffect(() => {
		if (abort != null) {
			abort.abort();
		}

		abort = new AbortController();
		validate(abort.signal);
	}, [text]);

	let classes = "";
	if (touched) {
		classes = "ion-touched";
	}
	if (valid) {
		classes += " ion-valid";
	}
	else {
		classes += " ion-invalid";
	}
	
	return (
		<IonInput	ref={data.ref} className={classes} counter={true} errorText={errorMessage}
					fill="outline" label={data.label} labelPlacement="floating"
					onIonInput={e => setText(e.detail.value!)} onIonBlur={() => setTouched(true)}
					required type={data.fieldType as any} value={text}>
			{ data.children }
		</IonInput>
	);
}
