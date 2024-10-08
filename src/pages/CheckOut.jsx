// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import {
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   SystemProgram,
//   Transaction,
// } from "@solana/web3.js";
// import { useState, useEffect } from "react";
// import { Buffer } from "buffer";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// // import { resetState } from "../redux/Slices/CartSlice";

// window.Buffer = Buffer;

// const CheckOut = () => {
//   const wallet = useWallet();
//   const { connection } = useConnection();
//   const [toPublicKey, setToPublicKey] = useState(
//     "jk2dLkNjZMQqaWnJDWM5BowPSoSGhUVRvqyhfJ44n1P"
//   );
//   const [amount, setAmount] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { cart } = useSelector((state) => state);
//   const [totalAmount, setTotalAmount] = useState(0);


//   useEffect(() => {
//       getItem();
//   }, [cart]);

//   const getItem = async () => {
//     try {
//       const res = await fetch("http://localhost:8080/cart", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(cart),
//       });

//       if (!res.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await res.json();
//       setAmount(data.orders.reduce((acc, curr) => acc + curr.price, 0));
//     } catch (error) {
//       console.error("Failed to fetch items:", error);
//     }
//   };

//   async function sendTokens(to) {
//     // Validate inputs
//     try {
//       const balanceInSOL = await connection.getBalance(
//         new PublicKey(wallet.publicKey)
//       );
//       new PublicKey(to); // Validate the public key
//       const parsedAmount = parseFloat(amount);
//       if (isNaN(parsedAmount) || parsedAmount <= 0) {
//         setStatusMessage("Please enter a valid amount.");
//         return;
//       }

//       if (wallet.publicKey.toString() === to) {
//         setStatusMessage("You cannot send SOL to yourself.");
//         return;
//       }

//       const transaction = new Transaction();
//       transaction.add(
//         SystemProgram.transfer({
//           fromPubkey: wallet.publicKey,
//           toPubkey: new PublicKey(to),
//           lamports: parsedAmount * LAMPORTS_PER_SOL,
//         })
//       );

//       setLoading(true); // Set loading state

//       if (balanceInSOL < parsedAmount * LAMPORTS_PER_SOL) {
//         setStatusMessage("Insufficient SOL balance.");
//         return;
//       }

//       if (isNaN(amount) || amount <= 0) {
//         setStatusMessage("Please enter a valid amount.");
//         return;
//       }

//       const signature = await wallet.sendTransaction(transaction, connection);
//       console.log(`Transaction successful! Signature: ${signature}`);

//       setStatusMessage(`Transaction successful! Signature: ${signature}`);

//       await fetch("http://localhost:8080/payment", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           sender: wallet.publicKey.toString(),
//           receiver: to,
//           priceInSol: amount,
//         }),
//       });

//       await fetch("http://localhost:8080/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ cart, sender: wallet.publicKey.toString() }),
//       });

//       // resetState();

//     } catch (error) {
//       console.error("Transaction error:", error);
//       setStatusMessage(`Transaction failed: ${error.message}`);
//     } finally {
//       setLoading(false); // Reset loading state
//     }
//   }

//   return (
//     <>
//       <div className="flex flex-col gap-4 w-2/5 mx-auto border border-gray-600 rounded-lg p-4 mt-12 bg-slate-300">
//         <h1 className="text-3xl font-semibold text-center mb-4 mt-2">
//           Make Payment
//         </h1>
//         <input
//           type="text"
//           placeholder="Receiver's Address"
//           className="border border-gray-600 rounded-lg h-10 px-4"
//           readOnly
//           value={toPublicKey}
//         />
//         <input
//           type="text"
//           readOnly
//           value={Math.round(totalAmount * 100 * 0.007) / 100}
//           placeholder="Amount"
//           className="border border-gray-600 rounded-lg h-10 px-4"
//         />
//         <button
//           className="rounded-lg h-12 px-2 bg-[#512da8] disabled:bg-gray-700"
//           onClick={() => sendTokens(toPublicKey)}
//           disabled={!toPublicKey || !amount || loading}
//         >
//           {loading ? "Sending..." : "Send Solana"}
//         </button>
//         {statusMessage && <p className="mt-2 text-center">{statusMessage}</p>}
//         {!wallet.connected && (
//           <Link
//             to="/wallet"
//             replace={true}
//             className="rounded-lg h-12 px-2 bg-[#512da8] flex justify-center items-center"
//           >
//             Connect Wallet
//           </Link>
//         )}
//       </div>
//     </>
//   );
// };

// export default CheckOut;



import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// import { resetState } from "../redux/Slices/CartSlice"; // Uncomment this when implementing reset logic

window.Buffer = Buffer;

const CheckOut = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const dispatch = useDispatch();
  const [toPublicKey, setToPublicKey] = useState(
    "jk2dLkNjZMQqaWnJDWM5BowPSoSGhUVRvqyhfJ44n1P"
  );
  const [amount, setAmount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { cart } = useSelector((state) => state);

  useEffect(() => {
    getItem();
  }, [cart]);

  const getItem = async () => {
    try {
      const res = await fetch("http://localhost:8080/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cart),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      const total = data.orders.reduce((acc, curr) => acc + curr.price, 0);
      // setAmount(total); // Set the total amount directly
      setAmount(Math.round(total * 100 * 0.007) / 100);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setStatusMessage("Failed to fetch items from cart.");
    }
  };

  const sendTokens = async (to) => {
    try {
      // Validate inputs
      const balanceInSOL = await connection.getBalance(
        new PublicKey(wallet.publicKey)
      );
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setStatusMessage("Please enter a valid amount.");
        return;
      }

      if (wallet.publicKey.toString() === to) {
        setStatusMessage("You cannot send SOL to yourself.");
        return;
      }

      if (balanceInSOL < parsedAmount * LAMPORTS_PER_SOL) {
        setStatusMessage("Insufficient SOL balance.");
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(to),
          lamports: parsedAmount * LAMPORTS_PER_SOL,
        })
      );

      setLoading(true); // Set loading state

      const signature = await wallet.sendTransaction(transaction, connection);
      console.log(`Transaction successful! Signature: ${signature}`);
      setStatusMessage(`Transaction successful! Signature: ${signature}`);

      await fetch("http://localhost:8080/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: wallet.publicKey.toString(),
          receiver: to,
          signature: signature,
          priceInSol: amount,
        }),
      });

      await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart, sender: wallet.publicKey.toString() }),
      });

      // resetState(); // Uncomment to reset cart after successful payment
    } catch (error) {
      console.error("Transaction error:", error);
      setStatusMessage(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col gap-4 w-2/5 mx-auto border border-gray-600 rounded-lg p-4 mt-12 bg-slate-300">
      <h1 className="text-3xl font-semibold text-center mb-4 mt-2">
        Make Payment
      </h1>
      <input
        type="text"
        placeholder="Receiver's Address"
        className="border border-gray-600 rounded-lg h-10 px-4"
        readOnly
        value={toPublicKey}
      />
      <input
        type="text"
        readOnly
        value={amount}
        placeholder="Amount"
        className="border border-gray-600 rounded-lg h-10 px-4"
      />
      <button
        className="rounded-lg h-12 px-2 bg-[#512da8] disabled:bg-gray-700"
        onClick={() => sendTokens(toPublicKey)}
        disabled={!wallet.connected || loading}
      >
        {loading ? "Sending..." : "Send Solana"}
      </button>
      {statusMessage && <p className="mt-2 text-center">{statusMessage}</p>}
      {!wallet.connected && (
        <Link
          to="/wallet"
          replace={true}
          className="rounded-lg h-12 px-2 bg-[#512da8] flex justify-center items-center"
        >
          Connect Wallet
        </Link>
      )}
    </div>
  );
};

export default CheckOut;
