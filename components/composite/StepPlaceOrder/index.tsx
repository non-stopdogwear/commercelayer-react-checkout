import type { Order } from "@commercelayer/sdk"
import { useContext, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { RepeatIcon } from "../OrderSummary/RepeatIcon"

import { AppContext } from "components/data/AppProvider"
import { GTMContext } from "components/data/GTMProvider"
import { FlexContainer } from "components/ui/FlexContainer"
import { Label } from "components/ui/Label"
import { SpinnerIcon } from "components/ui/SpinnerIcon"

import { ErrorIcon } from "./ErrorIcon"
import { messages } from "./messages"
import {
  ErrorIco,
  ErrorMessage,
  ErrorsContainer,
  ErrorWrapper,
  StyledErrors,
  StyledPlaceOrderButton,
  StyledPrivacyAndTermsCheckbox,
  PlaceOrderButtonWrapper,
} from "./styled"
import { WarningIcon } from "./WarningIcon"

interface Props {
  isActive: boolean
  termsUrl: NullableType<string>
  privacyUrl: NullableType<string>
}

const StepPlaceOrder: React.FC<Props> = ({
  isActive,
  termsUrl,
  privacyUrl,
}) => {
  const { t } = useTranslation()

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const appCtx = useContext(AppContext)
  const gtmCtx = useContext(GTMContext)

  if (!appCtx) {
    return null
  }

  const { placeOrder } = appCtx

  const handlePlaceOrder = async ({
    placed,
    order,
  }: {
    placed: boolean
    order?: Order
  }) => {
    if (placed) {
      setIsPlacingOrder(true)
      await placeOrder(order)
      if (gtmCtx?.firePurchase && gtmCtx?.fireAddPaymentInfo) {
        gtmCtx.fireAddPaymentInfo()
        gtmCtx.firePurchase()
      }
      setIsPlacingOrder(false)
    }
  }

  return (
    <>
      {appCtx.hasSubscriptions && isActive && (
        <div
          className={`m-5 mb-0 border border-dashed p-4 text-sm font-semibold text-gray-500 md:mx-0 md:mb-5 ${
            !appCtx.isGuest ? "" : "border-orange-400"
          }`}
        >
          {appCtx.isGuest ? (
            <div className="flex">
              <div className="relative top-0.5 mr-2 w-4">
                <WarningIcon />
              </div>
              <p>{t("stepPayment.subscriptionWithoutCustomer")}</p>
            </div>
          ) : (
            <div className="flex">
              <div className="relative top-0.5 mr-2 w-4">
                <RepeatIcon />
              </div>
              <p>{t("stepPayment.subscriptionWithCustomer")}</p>
            </div>
          )}
        </div>
      )}
      <ErrorsContainer data-testid="errors-container">
        <StyledErrors
          resource="orders"
          messages={
            messages &&
            messages.map((msg) => {
              return { ...msg, message: t(msg.message) }
            })
          }
        >
          {(props) => {
            if (props.errors?.length === 0) {
              return null
            }
            const compactedErrors = props.errors
            return (
              <>
                {compactedErrors?.map((error, index) => {
                  if (error?.trim().length === 0 || !error) {
                    return null
                  }
                  return (
                    <ErrorWrapper key={index}>
                      <ErrorIco>
                        <ErrorIcon />
                      </ErrorIco>
                      <ErrorMessage>{error}</ErrorMessage>
                    </ErrorWrapper>
                  )
                })}
              </>
            )
          }}
        </StyledErrors>
      </ErrorsContainer>

      <>
        {!!termsUrl && !!privacyUrl && (
          <FlexContainer className="mx-5 mb-2.5 mt-4 items-start md:mx-0 md:mb-5 md:mt-0 md:border-b md:pb-5 lg:pl-8">
            <StyledPrivacyAndTermsCheckbox
              id="privacy-terms"
              className="form-checkbox relative top-0.5"
              data-testid="checkbox-privacy-and-terms"
            />
            <Label htmlFor="privacy-terms">
              <Trans
                i18nKey="general.privacy_and_terms"
                components={{
                  bold: <strong />,
                  termsUrl: (
                    <a href={termsUrl} target="_blank" rel="noreferrer" />
                  ),
                  privacyUrl: (
                    <a href={privacyUrl} target="_blank" rel="noreferrer" />
                  ),
                }}
              />
            </Label>
          </FlexContainer>
        )}
        <PlaceOrderButtonWrapper>
          <StyledPlaceOrderButton
            data-testid="save-payment-button"
            isActive={isActive}
            onClick={handlePlaceOrder}
            label={
              <>
                {isPlacingOrder && <SpinnerIcon />}
                {t("stepPayment.submit")}
              </>
            }
          />
        </PlaceOrderButtonWrapper>
      </>
    </>
  )
}

export default StepPlaceOrder
