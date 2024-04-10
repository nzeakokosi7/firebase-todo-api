import {Request, Response} from "express";
import * as adminAuth from "firebase-admin/auth";
import {logger} from "firebase-functions";
import {initializeApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
// eslint-disable-next-line max-len
import {getFirestore, collection, doc, setDoc, query, where, getDocs, updateDoc} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
};
const app = initializeApp(firebaseConfig);
const createUser = async (req: Request, res: Response) => {
  const {email, password, firstName, lastName} = req.body;
  const fullName = firstName + " " + lastName;
  adminAuth.getAuth()
      .createUser({
        email: email,
        password: password,
        displayName: fullName,
      })
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        logger.log("Successfully created new user:", userRecord.uid);
        const {email, displayName, uid} = userRecord;
        res.json({uid, email, displayName});
      })
      .catch((error) => {
        logger.log("Error creating new user:", error);
        res.status(400).json({
          error: error,
        });
      });
};

const authenticateUser = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const auth = getAuth(app);
  signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const {email, displayName, uid} = user;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const {createdAt, lastLoginAt} = user.metadata;
        const idToken = await user.getIdToken();
        logger.log("Successfully authenticated new user:", user);
        // eslint-disable-next-line max-len
        res.json({uid, email, displayName, createdAt, lastLoginAt, idToken});
      })
      .catch((error) => {
        const errorMessage = error.message;

        logger.log("Error authenticating user:", errorMessage);
        res.status(401).json({
          error: errorMessage,
        });
      });
};

const createTodo = async (req: Request, res: Response) => {
    type todoModel = {
        id: string | null;
        uid: string;
        task: string;
        completed: boolean
    }
    const db = getFirestore(app);
    const {task, uid} = req.body;

    if (task && typeof task === "string" && task.length > 4) {
      // eslint-disable-next-line max-len
      const todo: todoModel = {id: null, task: task, completed: false, uid: uid};

      const newTodoRef = doc(collection(db, "todos"));
      todo.id = newTodoRef.id;

      await setDoc(newTodoRef, todo).then(() => {
        res.status(200).json({todo});
      }).catch((error) => {
        res.status(400).json({error});
      });
    } else {
      res.status(400).json({error: "Null or unexpected task format"});
    }
};

const getTodos = async (req: Request, res: Response) => {
  const db = getFirestore(app);
  const {uid} = req.body;

  const q = query(collection(db, "todos"), where("uid", "==", uid));
  const querySnapShot = await getDocs(q);
  const todos = querySnapShot.docs.map((doc) => doc.data());
  res.status(200).json({todos});
};

const getTodosById = async (req: Request, res: Response) => {
  const db = getFirestore(app);
  const {uid} = req.body;
  const id = req.params.id;

  const q = query(collection(db, "todos"),
      where("uid", "==", uid),
      where("id", "==", id));
  const querySnapShot = await getDocs(q);

  if (!querySnapShot.empty) {
    const todo = querySnapShot.docs[0].data();
    res.status(200).json({todo});
  } else {
    res.status(400).json(
        {error: "You don't have any todo with such Id", id});
  }
};

const updateTodo = async (req: Request, res: Response) => {
  const db = getFirestore(app);
  const {task, uid} = req.body;
  const id = req.params.id;

  if (task && typeof task === "string" && task.length > 4) {
    const q = query(collection(db, "todos"),
        where("uid", "==", uid),
        where("id", "==", id));
    const querySnapShot = await getDocs(q);
    if (querySnapShot.empty) {
      res.status(400).json(
          {error: "You don't have any todo with such Id", id});
    } else {
      const todo = querySnapShot.docs[0];
      await updateDoc(todo.ref, {task}).then(()=> {
        const {completed, id, uid} = todo.data();
        res.status(200).json({task, completed, id, uid});
      });
    }
  }
};

const completeTodo = async (req: Request, res: Response) => {
  const db = getFirestore(app);
  const {uid} = req.body;
  const id = req.params.id;

  const q = query(collection(db, "todos"),
      where("uid", "==", uid),
      where("id", "==", id));
  const querySnapShot = await getDocs(q);
  if (querySnapShot.empty) {
    res.status(400).json({error: "You don't have any todo with such Id", id});
  } else {
    const todo = querySnapShot.docs[0];
    await updateDoc(todo.ref, {completed: true}).then((()=> {
      const {task, id, uid} = todo.data();
      res.status(200).json({task, completed: true, id, uid});
    }));
  }
};

// eslint-disable-next-line max-len
module.exports = {createUser, authenticateUser, createTodo, getTodos, getTodosById, updateTodo, completeTodo};
