import express from "express";
import { getAllColumns , getColumnID,createColumn , updateColumn  , deleteColumn} from "../controlers/kanbanColumn.js";
import { authenticate, authorized } from "../middleware/auth.js";
const KAnbanColumnRoutes = express.Router();
KAnbanColumnRoutes.route("/")
  .get(authenticate, authorized, getAllColumns)
  .post(authenticate, authorized, createColumn)
  .patch(authenticate, authorized, updateColumn);
KAnbanColumnRoutes.route("/:id")
  .get(authenticate, authorized, getColumnID)
  .patch(authenticate, authorized, updateColumn)
  .delete(authenticate, authorized, deleteColumn);
export default KAnbanColumnRoutes;
