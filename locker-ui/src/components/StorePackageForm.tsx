import React, { useEffect, useState } from "react";
import { storePackage } from "../api/http";
import { Locker, StorePackageRequest } from "../types/locker";
import {
  messageSyntax,
  packageStatusSyntax,
  processingSyntax,
  syntax,
} from "./Constant";
import PackageSizeSelect from "./PackageSizeSelect";
import { EMAIL_REGEX, PHONE_REGEX } from "./Regex";

interface StorePackageFormProps {
  onSuccess: () => void | Promise<void>;
  selectedLocker: Locker | null;
}

const initialFormState: StorePackageRequest = {
  packageSize: "SMALL",
  customerInfo: {
    name: "",
    email: "",
    phone: "",
  },
};

export default function StorePackageForm({
  onSuccess,
  selectedLocker,
}: StorePackageFormProps) {
  const [formState, setFormState] =
    useState<StorePackageRequest>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState<"success" | "error">("success");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const isOccupied =
    selectedLocker?.status === `${packageStatusSyntax.occupied}`;
  const selectedLockerMessage = isOccupied
    ? messageSyntax.lockerOccupied
    : selectedLocker
      ? `${messageSyntax.lockerLabel} ${selectedLocker.name} (${selectedLocker.size})`
      : messageSyntax.selectLocker;

  const setCustomerField = (
    field: "name" | "email" | "phone",
    value: string,
  ): void => {
    setFormState((current) => ({
      ...current,
      customerInfo: {
        ...current.customerInfo,
        [field]: value,
      },
    }));
  };

  const validateContactFields = (): boolean => {
    const emailValid = EMAIL_REGEX.test(formState.customerInfo.email);
    const phoneValid = PHONE_REGEX.test(formState.customerInfo.phone);

    setEmailError(emailValid ? "" : messageSyntax.emailValidation);
    setPhoneError(phoneValid ? "" : messageSyntax.phoneValidation);

    return emailValid && phoneValid;
  };

  useEffect(() => {
    if (!selectedLocker) {
      return;
    }

    setFormState((current) => ({
      ...current,
      packageSize: selectedLocker.size,
    }));

    setMessage((current) =>
      current === messageSyntax.selectLocker ? "" : current,
    );
  }, [selectedLocker]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLocker) {
      setIsError("error");
      setMessage(messageSyntax.selectLocker);
      return;
    }

    if (!validateContactFields()) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const result = await storePackage({
        ...formState,
        lockerId: selectedLocker.id,
      });
      setIsError("success");
      setMessage(
        `Stored in locker ${result.data.lockerId} with pickup code ${result.data.pickupCode}`,
      );
      setFormState(initialFormState);
      setEmailError("");
      setPhoneError("");
      await onSuccess();
    } catch (err) {
      setIsError("error");
      setMessage(err instanceof Error ? err.message : messageSyntax.storeError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="store-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="panel-kicker">{syntax.deliveryAgent}</p>
        <h2>{syntax.storePackage}</h2>
      </div>

      <label
        style={{
          fontWeight: "bold",
          color: isOccupied ? "var(--danger)" : undefined,
        }}
      >
        {selectedLockerMessage}
      </label>

      <label>
        {syntax.customerName}
        <input
          value={formState.customerInfo.name}
          onChange={(event) => setCustomerField("name", event.target.value)}
          placeholder={messageSyntax.customerNameValidation}
          disabled={isOccupied}
          required
        />
      </label>

      <label>
        {syntax.emailAddress}
        <input
          type="email"
          value={formState.customerInfo.email}
          onChange={(event) => {
            setEmailError("");
            setCustomerField("email", event.target.value);
          }}
          onBlur={() =>
            setEmailError(
              EMAIL_REGEX.test(formState.customerInfo.email)
                ? ""
                : messageSyntax.emailValidation,
            )
          }
          placeholder={messageSyntax.emailPlaceHolder}
          disabled={isOccupied}
          required
        />
        {emailError && <span className="field-error">{emailError}</span>}
      </label>

      <label>
        {syntax.phoneNumber}
        <input
          type="tel"
          value={formState.customerInfo.phone}
          onChange={(event) => {
            setPhoneError("");
            setCustomerField("phone", event.target.value);
          }}
          onBlur={() =>
            setPhoneError(
              PHONE_REGEX.test(formState.customerInfo.phone)
                ? ""
                : messageSyntax.phoneValidation,
            )
          }
          placeholder={messageSyntax.phoneNoPlaceHolder}
          disabled={isOccupied}
          required
        />
        {phoneError && <span className="field-error">{phoneError}</span>}
      </label>

      <div className="select-label">
        <span className="select-label__text">{syntax.packageSize}</span>
        <PackageSizeSelect
          value={formState.packageSize}
          onChange={(size) =>
            setFormState((current) => ({ ...current, packageSize: size }))
          }
          disabled={Boolean(selectedLocker) || isOccupied}
        />
      </div>

      <button type="submit" disabled={submitting || isOccupied}>
        {submitting ? processingSyntax.storing : syntax.storePackage}
      </button>

      {message && (
        <p className={isError === "error" ? "feedback error" : "feedback"}>
          {message}
        </p>
      )}
    </form>
  );
}
