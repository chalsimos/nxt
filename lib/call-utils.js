import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    setDoc,
  } from "firebase/firestore"
  import { db } from "./firebase"
  
  // Create a new call
  export const createCall = async (initiatorId, receiverId, callType, conversationId = null) => {
    try {
      const callData = {
        createdAt: serverTimestamp(),
        participants: [initiatorId, receiverId],
        type: callType, // "video" or "voice"
        status: "ringing",
        initiator: initiatorId,
        endedAt: null,
        duration: 0,
        messages: [],
        conversationId: conversationId, // Add conversation ID if provided
      }
  
      const callRef = await addDoc(collection(db, "calls"), callData)
  
      // Create an active call reference for the receiver
      await setDoc(doc(db, "activeCall", receiverId), {
        callId: callRef.id,
        participants: [initiatorId, receiverId],
        initiator: initiatorId,
        type: callType,
        createdAt: serverTimestamp(),
        conversationId: conversationId, // Add conversation ID if provided
      })
  
      return callRef.id
    } catch (error) {
      console.error("Error creating call:", error)
      throw error
    }
  }
  
  // Accept a call
  export const acceptCall = async (callId) => {
    try {
      await updateDoc(doc(db, "calls", callId), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error accepting call:", error)
      throw error
    }
  }
  
  // Reject a call
  export const rejectCall = async (callId) => {
    try {
      await updateDoc(doc(db, "calls", callId), {
        status: "rejected",
        endedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error rejecting call:", error)
      throw error
    }
  }
  
  // End a call
  export const endCall = async (callId, duration) => {
    try {
      await updateDoc(doc(db, "calls", callId), {
        status: "ended",
        endedAt: serverTimestamp(),
        duration: duration || 0,
      })
      return true
    } catch (error) {
      console.error("Error ending call:", error)
      throw error
    }
  }
  
  // Add a message to a call
  export const addCallMessage = async (callId, senderId, content) => {
    try {
      const callDoc = await getDoc(doc(db, "calls", callId))
  
      if (!callDoc.exists()) {
        throw new Error("Call not found")
      }
  
      const callData = callDoc.data()
      const messages = callData.messages || []
  
      const newMessage = {
        sender: senderId,
        content,
        timestamp: new Date().toISOString(),
      }
  
      await updateDoc(doc(db, "calls", callId), {
        messages: [...messages, newMessage],
      })
  
      return true
    } catch (error) {
      console.error("Error adding call message:", error)
      throw error
    }
  }
  
  // Get call history for a user
  export const getCallHistory = async (userId) => {
    try {
      const q = query(
        collection(db, "calls"),
        where("participants", "array-contains", userId),
        orderBy("createdAt", "desc"),
      )
  
      const querySnapshot = await getDocs(q)
      const calls = []
  
      querySnapshot.forEach((doc) => {
        calls.push({
          id: doc.id,
          ...doc.data(),
        })
      })
  
      return calls
    } catch (error) {
      console.error("Error getting call history:", error)
      throw error
    }
  }
  
  // Get call details
  export const getCallDetails = async (callId) => {
    try {
      const callDoc = await getDoc(doc(db, "calls", callId))
  
      if (!callDoc.exists()) {
        throw new Error("Call not found")
      }
  
      return {
        id: callDoc.id,
        ...callDoc.data(),
      }
    } catch (error) {
      console.error("Error getting call details:", error)
      throw error
    }
  }
  