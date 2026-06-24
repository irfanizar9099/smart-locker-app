import React, { useEffect, useState } from "react";
import { checkCharge, retrievePackage } from "../api/http";
import {
  ChargeCalculation,
  PaymentMethod,
  RetrievePackageRequest,
} from "../types/locker";
import {
  currencySyntax,
  messageSyntax,
  paymentSyntax,
  processingSyntax,
  syntax,
} from "./Constant";

interface RetrievePackageFormProps {
  onSuccess: () => void;
  selectedLockerId: number | null;
}

type StatusType = "success" | "error";

type ChargeInfo = {
  storedDays: number;
  storageCharge: number;
  chargeCalculation: ChargeCalculation[];
};

const initialRetrieveState: RetrievePackageRequest = {
  lockerId: 1,
  pickupCode: "",
};

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: string;
}[] = [
  { value: "CREDIT_CARD", label: paymentSyntax.creditCard, icon: "💳" },
  { value: "DEBIT_CARD", label: paymentSyntax.debitCard, icon: "🏦" },
  { value: "QR_PAY", label: paymentSyntax.onlineBanking, icon: "📱" },
  { value: "CASH", label: paymentSyntax.cash, icon: "💵" },
];

export default function RetrievePackageForm({
  onSuccess,
  selectedLockerId,
}: RetrievePackageFormProps) {
  const [retrieveState, setRetrieveState] =
    useState<RetrievePackageRequest>(initialRetrieveState);
  const [checking, setChecking] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<StatusType>("success");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [enteredAmount, setEnteredAmount] = useState("");
  const [chargeInfo, setChargeInfo] = useState<ChargeInfo | null>(null);

  const showError = (text: string): void => {
    setStatus("error");
    setMessage(text);
  };

  const showSuccess = (text: string): void => {
    setStatus("success");
    setMessage(text);
  };

  const syncSelectedLocker = (): void => {
    if (!selectedLockerId) {
      return;
    }

    setRetrieveState((current) => {
      if (current.lockerId === selectedLockerId) {
        return current;
      }

      return {
        ...current,
        lockerId: selectedLockerId,
      };
    });
  };

  useEffect(() => {
    let timer: number | undefined;

    if (message) {
      timer = window.setTimeout(() => {
        setMessage("");
      }, 10000);
    }

    syncSelectedLocker();

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [message, selectedLockerId]);

  const validatePaymentAmount = (): boolean => {
    if (!enteredAmount) {
      showError(paymentSyntax.paymentError);
      return false;
    }

    const amount = Number(enteredAmount);
    const expected = chargeInfo?.storageCharge || 0;

    if (Math.abs(amount - expected) > 0.01) {
      showError(
        `Amount mismatch. Expected ${currencySyntax.RM} ${expected.toFixed(2)}, got ${currencySyntax.RM} ${amount.toFixed(2)}`,
      );
      return false;
    }

    return true;
  };

  const handleCheckCharge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChecking(true);
    setMessage("");
    setPaymentMethod(null);

    try {
      const result = await checkCharge(retrieveState);
      setChargeInfo({
        storedDays: result.data.storedDays,
        storageCharge: result.data.storageCharge,
        chargeCalculation: result.data.chargeCalculation,
      });
    } catch (err) {
      showError(
        err instanceof Error ? err.message : paymentSyntax.failedCharge,
      );
      setChargeInfo(null);
    } finally {
      setChecking(false);
    }
  };

  const handleConfirmRetrieval = () => {
    if (!paymentMethod) {
      showError(paymentSyntax.selectPayment);
      return;
    }

    setEnteredAmount(
      chargeInfo?.storageCharge.toFixed(2) || paymentSyntax.defaultAmount,
    );
    setShowPaymentDialog(true);
  };

  const handlePaymentConfirm = async () => {
    if (!validatePaymentAmount()) {
      return;
    }

    setShowPaymentDialog(false);
    setRetrieving(true);
    setMessage("");

    try {
      const result = await retrievePackage(retrieveState);
      showSuccess(
        `Locker ${result.data.lockerId} opened — package retrieved successfully.`,
      );
      setChargeInfo(null);
      setRetrieveState(initialRetrieveState);
      setPaymentMethod(null);
      setEnteredAmount("");
      onSuccess();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : messageSyntax.retrieveLockerError,
      );
      setShowPaymentDialog(false);
    } finally {
      setRetrieving(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setEnteredAmount("");
  };

  const handleBack = () => {
    setChargeInfo(null);
    setPaymentMethod(null);
    setMessage("");
  };

  const messageClass = status === "error" ? "feedback error" : "feedback";

  if (!chargeInfo) {
    return (
      <form className="store-form" onSubmit={handleCheckCharge}>
        <div className="section-heading">
          <p className="panel-kicker">{syntax.customer}</p>
          <h2>{syntax.retrievePackage}</h2>
        </div>

        <label>
          {syntax.lockerId}
          <input
            type="number"
            min="1"
            value={retrieveState.lockerId}
            onChange={(event) =>
              setRetrieveState((current) => ({
                ...current,
                lockerId: Number(event.target.value),
              }))
            }
            required
          />
        </label>

        <p className="selected-locker-note">
          {selectedLockerId
            ? `${messageSyntax.showLockerLayout}: ${syntax.lockerId} ${selectedLockerId}`
            : messageSyntax.chooseLocker}
        </p>

        <label>
          {syntax.pickupCode}
          <input
            value={retrieveState.pickupCode}
            onChange={(event) =>
              setRetrieveState((current) => ({
                ...current,
                pickupCode: event.target.value,
              }))
            }
            placeholder={messageSyntax.enterPickupCode}
            required
          />
        </label>

        {message && <p className={messageClass}>{message}</p>}

        <button type="submit" disabled={checking}>
          {checking ? processingSyntax.checking : syntax.retrievePackage}
        </button>
      </form>
    );
  }

  return (
    <div className="store-form">
      <div className="section-heading">
        <p className="panel-kicker">{syntax.confirmRetrieval}</p>
        <h2>{syntax.storageCharges}</h2>
      </div>

      <div className="charge-summary">
        <table className="charge-table">
          <thead>
            <tr>
              <th>{syntax.days}</th>
              <th>{syntax.ratePerDay}</th>
              <th>{syntax.subtotal}</th>
            </tr>
          </thead>
          <tbody>
            {chargeInfo.chargeCalculation?.map((tier, index) => (
              <tr key={index}>
                <td>{tier.days}</td>
                <td>
                  {currencySyntax.RM} {tier.ratePerDay.toFixed(2)}
                </td>
                <td>
                  {currencySyntax.RM} {tier.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="charge-table__total">
              <td colSpan={2}>
                {syntax.subtotal} ({chargeInfo.storedDays}{" "}
                {syntax.days.toLowerCase()}
                {chargeInfo.storedDays !== 1 ? "s" : ""})
              </td>
              <td>
                {currencySyntax.RM} {chargeInfo.storageCharge.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="payment-methods">
        <p className="payment-methods__label">
          {messageSyntax.selectPaymentMethod}
        </p>
        <div className="payment-buttons">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              className={`payment-button ${
                paymentMethod === method.value ? "payment-button--active" : ""
              }`}
              onClick={() => setPaymentMethod(method.value)}
            >
              <span className="payment-button__icon">{method.icon}</span>
              <span className="payment-button__label">{method.label}</span>
            </button>
          ))}
        </div>
        {paymentMethod && (
          <p className="payment-methods__selected">
            {syntax.selectedPaymentMethod}:{" "}
            {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
          </p>
        )}
      </div>

      {message && <p className={messageClass}>{message}</p>}

      <div className="button-group">
        <button
          type="button"
          className="button-secondary"
          onClick={handleBack}
          disabled={retrieving}
        >
          {syntax.back}
        </button>
        <button
          type="button"
          disabled={!paymentMethod || retrieving}
          onClick={handleConfirmRetrieval}
        >
          {retrieving
            ? processingSyntax.confirming
            : processingSyntax.confirmAndRetrieve}
        </button>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="payment-dialog-overlay">
          <div className="payment-dialog">
            <div className="payment-dialog__header">
              <h3>{syntax.confirmPayment}</h3>
            </div>

            <div className="payment-dialog__body">
              <p className="payment-dialog__label">
                {messageSyntax.enterAmountToPay}
              </p>
              <p className="payment-dialog__amount">
                {currencySyntax.RM} {chargeInfo.storageCharge.toFixed(2)}
              </p>
              <input
                type="number"
                step="0.01"
                value={enteredAmount}
                onChange={(event) => setEnteredAmount(event.target.value)}
                className="payment-dialog__input"
                placeholder={paymentSyntax.defaultAmount}
              />
            </div>

            <div className="payment-dialog__footer">
              <button
                type="button"
                className="payment-dialog__cancel"
                onClick={handleCancelPayment}
              >
                {syntax.cancel}
              </button>
              <button
                type="button"
                className="payment-dialog__pay"
                onClick={handlePaymentConfirm}
              >
                {syntax.pay}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
