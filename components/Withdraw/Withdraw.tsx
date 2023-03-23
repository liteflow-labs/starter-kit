import {
    Button,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useEffect, useState } from "react";
import axios from "axios"
import { useWeb3React } from '@web3-react/core'
import environment from '../../environment'
import useSigner from '../../hooks/useSigner'
import useTranslation from 'next-translate/useTranslation'

function Withdraw() {
    const { t } = useTranslation('components')
    const signer = useSigner();

    // current account address
    const { account } = useWeb3React()

    const [transferAmount, setTransferAmount] = useState<number>(1)
    const [withdrawTransferDisabled, setWithdrawTransferDisabled] = useState<boolean>(false)

    const [currentDefyBalance, setCurrentDefyBalance] = useState<number>(0)

    const [isTransferring, setIsTransferring] = useState<boolean>(false)

    const updateUserCurrentDefy = async () => {
        const url = `${environment.DEFY_API_BASE_URL}/Operatives/defyBalance`

        try {
            const result = await axios.get(url, {
                params: {
                    connectedAddress: account
                }
            })
            setCurrentDefyBalance(await result.data.amount)
        } catch (e) {
            return "[error processing]"
        }
    }

    function getTotalAmountAfterWithdrawFormatted(): string {
        try {
            const total = currentDefyBalance - transferAmount
            return total.toFixed(2)
        } catch (err) {
            return "[error processing]"
        }
    }

    useEffect(() => {
        if (transferAmount > currentDefyBalance) {
            setWithdrawTransferDisabled(true)
        } else {
            setWithdrawTransferDisabled(false)
        }
    }, [transferAmount])

    const withdrawToChain = async () => {
        if (transferAmount != 0) {
            // operative to sign message
            var message = `DEFY Withdrawal Request\nWallet Address: ${account}\nTokens: ${transferAmount}`;

            try {
                setIsTransferring(true)
                var signedMessageHash = await signer?.signMessage(message)

                // build webApi endpoint url
                const url = `${environment.DEFY_API_BASE_URL}/TokenBridge/withdrawTokens`
                const result = await axios.post(url, {
                    WalletAddress: account,
                    Message: message,
                    Signature: signedMessageHash
                })
                console.log(result)
                setIsTransferring(false)
            } catch (err) {
                setIsTransferring(false)
                return "[error processing]"
            }
        }
    }

    useEffect(() => {
        if (account) { updateUserCurrentDefy() }

        // TODO: add in after withdraw
    }, [account])

    return account ? (
        <Stack
            align="flex-start"
            spacing={12}
            flex="1 1 0%"
        >
            {(
                <>
                    <Text>
                        {t('withdraw.from') + " @" + account}
                    </Text>

                    {/**<img src={defyIcon} className="w-5 h-5" alt="" /> */}

                    <NumberInput
                        clampValueOnBlur={false}
                        value={transferAmount}
                        min={1}
                        max={100000}
                        step={10}
                        w="full"
                        onChange={(e) => {
                            if (e) { // only call setTransferAmount if e is not empty or undefined
                                try {
                                    setTransferAmount(parseFloat(e));
                                } catch (error) {
                                    console.error(error);
                                    // handle the error here (e.g. show an error message to the user)
                                }
                            }
                        }}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    {" "}
                    <Text>
                        {t('withdraw.balance')}{" "}
                        {typeof currentDefyBalance === 'number' ? currentDefyBalance.toString() : 'N/A'}
                    </Text>
                    <Button
                        variant='outline'
                        onClick={async () => {
                            setTransferAmount(currentDefyBalance || 0)
                            if (currentDefyBalance) {
                                setTransferAmount(currentDefyBalance)
                            }
                        }}
                    >
                        Max
                    </Button>

                    <Text as="span" isTruncated>
                        {t('withdraw.to')}{" "}{account}
                    </Text>

                    <Text>
                        {transferAmount && !withdrawTransferDisabled &&
                            `${t('withdraw.after')} ${getTotalAmountAfterWithdrawFormatted()} DEFY`}
                    </Text>

                    {!withdrawTransferDisabled &&
                        (!isTransferring ?
                            <Button
                                variant='outline'
                                onClick={async () => {
                                    if (transferAmount) {
                                        await withdrawToChain()
                                    }
                                }}
                            >
                                {t('withdraw.transfer')}
                            </Button>
                            :
                            <Button
                                isLoading
                                loadingText='Transferring'
                                variant='outline'
                            >
                            </Button>
                        )
                    }
                </>
            )}
        </Stack>
    ) : (
        <Stack
            align="flex-start"
            spacing={12}
            as="form"
            flex="1 1 0%"
        >
            loading...
        </Stack>
    )
}

export default Withdraw