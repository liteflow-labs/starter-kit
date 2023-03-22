import { useEffect, useRef, useState } from "react";
import { BigNumber, ethers } from "ethers"
import axios from "axios"
import { useWeb3React } from '@web3-react/core'
import environment from '../../environment'
import useSigner from '../../hooks/useSigner'

function Withdraw() {

    const signer = useSigner();

    const inputRef = useRef<HTMLInputElement>(null)

    // current account address
    const { account } = useWeb3React()

    const [transferAmount, setTransferAmount] = useState<any>(BigNumber.from(0))
    const [withdrawTransferDisabled, setWithdrawTransferDisabled] = useState<boolean>(false)

    const [currentDefyBalance, setCurrentDefyBalance] = useState<number>(0)

    const updateUserCurrentDefy = async () => {
        const url = `${environment.DEFY_API_BASE_URL}/Operatives/${account}/defyWallet`
        try {
            const result = await axios.get(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            console.log(result)
            setCurrentDefyBalance(await result.data)
        } catch (e) {
            return "[error processing]"
        }
    }

    function getTotalAmountAfterWithdrawFormatted(): string {
        try {
            const transferAmountNumber = parseFloat(ethers.utils.formatEther(transferAmount))
            const total = currentDefyBalance - transferAmountNumber
            return total.toFixed(4)
        } catch (err) {
            return "[error processing]"
        }
    }

    useEffect(() => {
        if (parseFloat(ethers.utils.formatEther(transferAmount)) > currentDefyBalance) {
            setWithdrawTransferDisabled(true)
        } else {
            setWithdrawTransferDisabled(false)
        }
    }, [transferAmount])

    const withdrawToChain = async () => {
        // operative to sign message
        var message = `DEFY Withdrawal Request\nWallet Address: ${account}\nTokens: ${parseFloat(ethers.utils.formatEther(transferAmount))}`;

        var signedMessageHash = await signer?.signMessage(message)

        // build webApi endpoint url
        const url = `${environment.DEFY_API_BASE_URL}/TokenBridge/withdrawTokens`

        try {
            const result = await axios.post(url, {
                WalletAddress: account,
                Message: message,
                Signature: signedMessageHash
            })
            console.log(result)
        } catch (err) {
            return "[error processing]"
        }
    }

    useEffect(() => {
        setTimeout(() => { updateUserCurrentDefy(), 3000 })
        // TODO: add in after withdraw
    }, [])

    return account ? (
        <div className="grid grid-cols-2 w-full gap-1 ">
            <div className="flex items-center justify-center p-4 glass text-white col-span-2">
                WITHDRAW DEFY <div className="ml-2 i-carbon:arrows-horizontal" />
            </div>

            <div className="flex flex-col items-center justify-center p-4 text-white col-span-2 glass">

                {(
                    <div className="text-left w-full flex flex-col gap-2">
                        <div className="leading-tight">
                            <span className="font-bold">From</span>
                            <br />
                            <span className="text-xs text-white:80">
                                {
                                    "@" + account
                                }
                            </span>
                        </div>
                        <div className="flex border-1 p-2 gap-2 items-center">
                            {/**<img src={defyIcon} className="w-5 h-5" alt="" /> */}

                            <input
                                onChange={(e) => {
                                    setTransferAmount(ethers.utils.parseEther(e.target.value))
                                }}
                                ref={inputRef}
                                type="number"
                                step="10"
                                min="0"
                                max="100000"
                                className="bg-transparent px-2 py-1 border-b-transparent border-b-2 focus:border-b-green focus:bg-black:40 outline-none min-w-40"
                                placeholder="0.00"
                            />{" "}
                            <div className="flex-1 text-left text-xs text-white:80">
                                of total in-game balance{" "}
                                {currentDefyBalance.toFixed(1)}
                            </div>
                            <button
                                onClick={() => {
                                    setTransferAmount(ethers.utils.parseEther(
                                        currentDefyBalance.toString() || "0")
                                    )
                                    if (inputRef.current && currentDefyBalance) {
                                        inputRef.current.value = currentDefyBalance.toFixed(1).toString()
                                        setTransferAmount(ethers.utils.parseEther(currentDefyBalance.toString()))
                                    }
                                }}
                            >
                                Max
                            </button>

                        </div>
                        <div className="w-10 h-10 border-1 rounded-full mx-auto flex items-center justify-center -mb-8">
                            <div className="i-carbon:arrow-down" />
                        </div>
                        <span className="font-bold">
                            To{" "}
                            <span className="text-xs font-normal text-white:80">
                                {
                                    account
                                }
                            </span>
                        </span>

                        <div className="bg-black:40 p-2 flex gap-2 items-center">
                            {/** <img src={defyIcon} className="w-5 h-5" alt="" /> */}
                            {currentDefyBalance &&
                                ethers.utils.formatEther(currentDefyBalance) || 0.0
                            }
                            <span className="text-xs text-white:80">
                                Current on-chain balance
                            </span>
                        </div>
                        <span className="text-xs text-white:80">
                            {transferAmount && !withdrawTransferDisabled &&
                                `After transfer your in game balance will be ${getTotalAmountAfterWithdrawFormatted()}`}
                        </span>

                        {!withdrawTransferDisabled &&
                            <button
                                className="bg-black:90 p-3 hover:bg-green hover:text-black hover:tracking-tight"
                                onClick={async () => {
                                    if (!transferAmount.isZero()) {
                                        await withdrawToChain()
                                    }
                                }}
                            >
                                TRANSFER
                            </button>
                        }
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div className="w-full flex justify-center items-center h-40 glass text-white">
            loading...
        </div>
    )
}


export default Withdraw