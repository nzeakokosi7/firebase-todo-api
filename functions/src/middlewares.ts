import {NextFunction, Request, Response} from "express";
import * as adminAuth from "firebase-admin/auth";

// eslint-disable-next-line max-len
const userCreationMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, password, firstName, lastName} = req.body;
    const passwordReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    // eslint-disable-next-line max-len
    const emailReg = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !emailReg.test(email)) {
      // eslint-disable-next-line no-throw-literal
      throw "Email is invalid";
    }

    if (!firstName || firstName.length < 3) {
      // eslint-disable-next-line no-throw-literal
      throw "firstName is not valid";
    }

    if (!lastName || lastName.length < 3) {
      // eslint-disable-next-line no-throw-literal
      throw "lastName is not valid";
    }

    if (!password || !passwordReg.test(password)) {
      // eslint-disable-next-line no-throw-literal
      throw "Password is invalid";
    }
    next();
  } catch (e) {
    res.status(400).json({
      error: e,
    });
  }
};

// eslint-disable-next-line max-len
const userAuthMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, password} = req.body;
    const passwordReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    // eslint-disable-next-line max-len
    const emailReg = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !emailReg.test(email)) {
      // eslint-disable-next-line no-throw-literal
      throw "Email is invalid";
    }

    if (!password || !passwordReg.test(password)) {
      // eslint-disable-next-line no-throw-literal
      throw "Password is invalid";
    }
    next();
  } catch (e) {
    res.status(400).json({
      error: e,
    });
  }
};

const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization != null) {
      if (!req.headers.authorization.startsWith("Bearer")) {
        // eslint-disable-next-line no-throw-literal
        throw "Invalid authorization header";
      }

      const token = req.headers.authorization.split(" ")[1];
      if (token && token.length > 0) {
        // eslint-disable-next-line no-useless-catch
        adminAuth.getAuth().verifyIdToken(token)
            .then((decodedToken) => {
              req.body.uid = decodedToken.uid;
              next();
            }).catch((e)=>{
              const {message} = e;
              res.status(401).json({
                error: message,
              });
            });
      } else {
        // eslint-disable-next-line no-throw-literal
        throw "Invalid auth token";
      }
    } else {
      // eslint-disable-next-line no-throw-literal
      throw "Protected route must provide valid auth token";
    }
  } catch (e: any) {
    res.status(401).json({
      error: e.toString(),
    });
  }
};

// eslint-disable-next-line max-len
module.exports = {userCreationMiddleWare, userAuthMiddleWare, authMiddleWare};
