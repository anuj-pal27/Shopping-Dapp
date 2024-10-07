import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const TransactionPage = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [toPublicKey, setToPublicKey] = useState("");
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { cart } = useSelector((state) => state);
  const [totalAmount, settotalAmount] = useState(0);

  useEffect(() => {
    settotalAmount(cart.reduce((acc, curr) => acc + curr.price, 0));
    setAmount(Math.round(totalAmount * 100 * 0.007) / 100);
  }, [cart, totalAmount]);

  async function sendTokens(to) {
    // Validate inputs
    try {
      const balanceInSOL = await connection.getBalance(
        new PublicKey(wallet.publicKey)
      );
      new PublicKey(to); // Validate the public key
      const parsedAmount = parseFloat(amount);
      console.log(parsedAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setStatusMessage("Please enter a valid amount.");
        return;
      }

      if (wallet.publicKey.toString() === to) {
        setStatusMessage("You cannot send SOL to yourself.");
        return;
      }

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(to),
          lamports: parsedAmount * LAMPORTS_PER_SOL,
        })
      );

      setLoading(true); // Set loading state

      if (balanceInSOL < parsedAmount * LAMPORTS_PER_SOL) {
        setStatusMessage("Insufficient SOL balance.");
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        setStatusMessage("Please enter a valid amount.");
        return;
      }

      const signature = await wallet.sendTransaction(transaction, connection);
      console.log(`Transaction successful! Signature: ${signature}`);

      setStatusMessage(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error("Transaction error:", error);
      setStatusMessage(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  const handleReceiver = (event) => {
    setToPublicKey(event.target.value);
    setStatusMessage(""); // Clear previous status messages
  };

  return (
    <>
      <h1 className="text-3xl font-semibold text-center my-8">
        Transaction
      </h1>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Receiver's Address"
          className="border border-gray-600 rounded-lg h-10 px-4"
          onChange={handleReceiver}
        />
        <input
          type="text"
          readOnly
          value={Math.round(totalAmount * 100 * 0.0070) / 100}
          placeholder="Amount"
          className="border border-gray-600 rounded-lg h-10 px-4"
        />
        <button
          className="rounded-lg h-12 px-2 bg-green-700 hover:bg-green-700 disabled:bg-slate-400"
          onClick={() => sendTokens(toPublicKey)}
          disabled={!toPublicKey || !amount || loading}
        >
          {loading ? "Sending..." : "Send Solana"}
        </button>
        {statusMessage && (
          <p className="mt-2 text-center">{statusMessage}</p>
        )}
        {!wallet.connected && (
          <p className="mt-2 text-center">
            Please connect your wallet
          </p>
        )}
      </div>
    </>
  );
};

export default TransactionPage;


