import { useMemo, useState } from "react";
import BaseButton from "../BaseButton";
import type CommentData from "./models/CommentData";
import { mdiCheck, mdiClose, mdiPencil, mdiTrashCan } from "@mdi/js";
import { useCommentPopupActions } from "../../stores/commentPopupStore";
import { useAdvancedSettings } from "../../stores/tableDataStore";

interface CommentPopupProps {
  comment: CommentData;
  isNewComment?: boolean;
  style?: React.CSSProperties;
  setIsEditing?: (isEditing: boolean) => void;
  isEditing?: boolean;
  columnId?: string;
  saveComment?: (comment: CommentData) => void;
  deleteComment?: (comment: CommentData) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function CommentPopup(props: CommentPopupProps) {
  const {
    comment,
    style,
    isEditing,
    onMouseEnter,
    setIsEditing,
    onMouseLeave,
  } = props;

  const [editedComment, setEditedComment] = useState(comment?.text || "");

  const { setOpenCommentCell } = useCommentPopupActions();
  const advancedSetting = useAdvancedSettings();

  const saveCommentHandler = () => {
    if (props.saveComment) {
      props.saveComment({
        ...comment,
        text: editedComment,
        columnId: props.columnId,
        author: advancedSetting?.currentUsername || "Unknown",
      });
      if (props.isNewComment) {
        setOpenCommentCell(undefined);
      }
      setIsEditing?.(false);
    }
  };

  const onCancel = () => {
    if (props.isNewComment) {
      setOpenCommentCell(undefined);
    }
    setEditedComment(comment.text);
    setIsEditing?.(false);
  };

  const initials = useMemo(() => {
    const nameParts = (
      comment.author ||
      advancedSetting?.currentUsername ||
      "Unknown"
    ).split(" ");
    return nameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [comment.author]);

  return (
    <div style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-2 ">
          <div className="avatar avatar-placeholder w-5">
            <div className="bg-neutral text-neutral-content w-5 rounded-full">
              <span className="text-xs">{initials}</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold">
              {(props.isNewComment
                ? advancedSetting?.currentUsername
                : comment.author) || "Unknown"}
            </span>
          </div>
        </div>
        <div>
          {!isEditing && (
            <div>
              <BaseButton
                onClick={() => props.deleteComment?.(comment)}
                className="mb-1 h-5 min-h-5"
                iconSize={0.6}
                small
                circle
                icon={mdiTrashCan}
                iconColor="var(--error-color)"
              />
              <BaseButton
                onClick={() => setIsEditing?.(true)}
                className="mb-1 ml-1 h-5 min-h-5"
                iconSize={0.6}
                small
                circle
                icon={mdiPencil}
                iconColor="var(--comment-color)"
              />
            </div>
          )}
        </div>
      </div>
      <div className="ml-7">
        {isEditing ? (
          <div>
            <input
              onMouseUp={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              className="input input-xs"
              type="text"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
            />

            <div className="flex justify-end mt-2">
              <BaseButton
                onClick={saveCommentHandler}
                text="Save"
                className="mb-1 h-5 min-h-5 "
                iconSize={0.6}
                small
                icon={mdiCheck}
                iconColor="var(--comment-color)"
              />
              <BaseButton
                onClick={onCancel}
                className="mb-1 h-5 min-h-5  ml-1"
                ghost
                iconSize={0.6}
                small
                icon={mdiClose}
                text="Cancel"
                iconColor="var(--error-color)"
              ></BaseButton>
            </div>
          </div>
        ) : (
          <div className="text-xs  ">
            <div>
              <div>{comment.text}</div>
              <span className="text-gray-500 font-light text-tiny">
                {comment.formatDateFunction
                  ? comment.formatDateFunction(comment.date)
                  : new Date(comment.date).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentPopup;

