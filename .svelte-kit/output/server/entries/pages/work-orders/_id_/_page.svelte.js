import { c as create_ssr_component, e as each, g as escape, f as add_attribute, v as validate_component } from "../../../../chunks/ssr.js";
import "devalue";
import { W as WORK_ORDER_STATUSES } from "../../../../chunks/constants.js";
import { l as linkifyMentions } from "../../../../chunks/mentions.js";
function getStatusColor$1(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-spore-forest text-white";
    case "IN_PROGRESS":
      return "bg-spore-orange text-white";
    case "PENDING":
      return "bg-spore-steel text-white";
    case "ON_HOLD":
      return "bg-spore-cream text-spore-steel border border-spore-steel";
    case "CANCELLED":
      return "bg-red-600 text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
function formatStatus(status) {
  return status.replace(/_/g, " ");
}
const StatusHistory = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { history } = $$props;
  if ($$props.history === void 0 && $$bindings.history && history !== void 0)
    $$bindings.history(history);
  return `<div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center gap-2"><span data-svelte-h="svelte-stchci">📋</span> <span data-svelte-h="svelte-8dhk2s">Status History</span></h2> ${history.length === 0 ? `<p class="text-spore-steel text-sm italic" data-svelte-h="svelte-kqr86c">No status changes recorded yet.</p>` : `<div class="relative"> <div class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-spore-cream"></div> <div class="space-y-4">${each(history, (entry, index) => {
    return `<div class="relative flex gap-4"> <div class="flex-shrink-0 w-4 h-4 rounded-full bg-spore-forest border-2 border-spore-cream z-10 mt-1"></div>  <div class="flex-1 min-w-0 pb-2"><div class="flex flex-wrap items-center gap-2 mb-1"><span class="${"px-2 py-0.5 text-xs font-bold rounded " + escape(getStatusColor$1(entry.fromStatus), true)}">${escape(formatStatus(entry.fromStatus))}</span> <span class="text-spore-steel" data-svelte-h="svelte-1s1x4f8">→</span> <span class="${"px-2 py-0.5 text-xs font-bold rounded " + escape(getStatusColor$1(entry.toStatus), true)}">${escape(formatStatus(entry.toStatus))} </span></div> <div class="text-sm text-spore-dark">${entry.user ? `<span class="font-semibold">${escape(entry.user.displayName)}</span>
									changed the status` : `Status changed`} <span class="text-spore-steel">${escape(new Date(entry.createdAt).toLocaleDateString())} at ${escape(new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} </span></div> ${entry.reason ? `<div class="mt-1 text-sm text-spore-steel italic">Reason: &quot;${escape(entry.reason)}&quot;
								</div>` : ``}</div> </div>`;
  })}</div></div>`}</div>`;
});
const Checklist = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let incompleteCount;
  let completedCount;
  let { items } = $$props;
  let { workOrderId } = $$props;
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.workOrderId === void 0 && $$bindings.workOrderId && workOrderId !== void 0)
    $$bindings.workOrderId(workOrderId);
  incompleteCount = items.filter((i) => !i.isCompleted).length;
  completedCount = items.filter((i) => i.isCompleted).length;
  items.length > 0 && incompleteCount === 0;
  return `<div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center justify-between"><div class="flex items-center gap-2"><span data-svelte-h="svelte-d2qxsh">✓</span> <span data-svelte-h="svelte-wwmsq">Checklist</span></div> ${items.length > 0 ? `<span class="text-sm font-normal text-spore-steel">${escape(completedCount)}/${escape(items.length)} done</span>` : ``}</h2>  ${items.length === 0 ? `<p class="text-spore-steel text-sm italic mb-4" data-svelte-h="svelte-583qw3">No checklist items yet.</p>` : `<div class="space-y-2 mb-4">${each(items, (item) => {
    return `<div class="${"group flex items-center gap-3 p-3 rounded-lg border " + escape(
      item.isCompleted ? "bg-spore-forest/5 border-spore-forest/20" : "bg-white border-spore-cream hover:border-spore-orange/30",
      true
    ) + " transition-colors"}"> <form method="POST" action="?/toggleChecklistItem" class="flex-shrink-0"><input type="hidden" name="itemId"${add_attribute("value", item.id, 0)}> <input type="hidden" name="isCompleted"${add_attribute("value", item.isCompleted ? "false" : "true", 0)}> <button type="submit" class="${"w-6 h-6 rounded border-2 flex items-center justify-center transition-colors " + escape(
      item.isCompleted ? "bg-spore-forest border-spore-forest text-white" : "border-spore-steel hover:border-spore-orange",
      true
    )}"${add_attribute("aria-label", item.isCompleted ? "Mark incomplete" : "Mark complete", 0)}>${item.isCompleted ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>` : ``} </button></form>  <span class="${"flex-1 text-sm " + escape(
      item.isCompleted ? "text-spore-steel line-through" : "text-spore-dark",
      true
    )}">${escape(item.title)}</span>  <form method="POST" action="?/deleteChecklistItem" class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><input type="hidden" name="itemId"${add_attribute("value", item.id, 0)}> <button type="submit" class="text-spore-steel hover:text-red-500 p-1 rounded" aria-label="Delete item"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg> </button></form> </div>`;
  })}</div>`}  ${`<button class="w-full px-4 py-2 rounded-lg border border-dashed border-spore-cream text-spore-steel text-sm font-semibold hover:border-spore-orange hover:text-spore-orange transition-colors" data-svelte-h="svelte-7pzuw7">+ Add item</button>`}</div>`;
});
const MAX_COMMENT_LENGTH = 5e3;
const CommentForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let remainingChars;
  let { mentionableUsers } = $$props;
  let { parentId = null } = $$props;
  let { placeholder = "Write a comment..." } = $$props;
  let { submitLabel = "Comment" } = $$props;
  let { onCancel = null } = $$props;
  let { autofocus = false } = $$props;
  let textareaElement;
  let content = "";
  if ($$props.mentionableUsers === void 0 && $$bindings.mentionableUsers && mentionableUsers !== void 0)
    $$bindings.mentionableUsers(mentionableUsers);
  if ($$props.parentId === void 0 && $$bindings.parentId && parentId !== void 0)
    $$bindings.parentId(parentId);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.submitLabel === void 0 && $$bindings.submitLabel && submitLabel !== void 0)
    $$bindings.submitLabel(submitLabel);
  if ($$props.onCancel === void 0 && $$bindings.onCancel && onCancel !== void 0)
    $$bindings.onCancel(onCancel);
  if ($$props.autofocus === void 0 && $$bindings.autofocus && autofocus !== void 0)
    $$bindings.autofocus(autofocus);
  remainingChars = MAX_COMMENT_LENGTH - content.length;
  return `<div class="space-y-3"><form method="POST" action="?/addComment"><div class="relative"><textarea name="content"${add_attribute("placeholder", placeholder, 0)} rows="3" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange resize-none" required${add_attribute("this", textareaElement, 0)}>${escape("")}</textarea>  <div class="absolute bottom-2 right-2 text-xs text-spore-steel">${escape(remainingChars)} remaining</div>  ${``}</div> <div class="flex gap-3"><button type="submit" ${!content.trim() || content.length > MAX_COMMENT_LENGTH ? "disabled" : ""} class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">${escape(submitLabel)}</button> ${onCancel ? `<button type="button" class="px-6 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors" data-svelte-h="svelte-nw0b6j">Cancel</button>` : ``}</div></form></div>`;
});
const MAX_DEPTH = 5;
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
  if (seconds < 60)
    return "just now";
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800)
    return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
const Comment = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let canReply;
  let canEdit;
  let isOwnComment;
  let showReplyButton;
  let displayName;
  let initials;
  let timeAgo;
  let linkifiedContent;
  let { comment } = $$props;
  let { currentUserId } = $$props;
  let { mentionableUsers } = $$props;
  let { maxDepth = 5 } = $$props;
  let isEditing = false;
  let showReplies = true;
  if ($$props.comment === void 0 && $$bindings.comment && comment !== void 0)
    $$bindings.comment(comment);
  if ($$props.currentUserId === void 0 && $$bindings.currentUserId && currentUserId !== void 0)
    $$bindings.currentUserId(currentUserId);
  if ($$props.mentionableUsers === void 0 && $$bindings.mentionableUsers && mentionableUsers !== void 0)
    $$bindings.mentionableUsers(mentionableUsers);
  if ($$props.maxDepth === void 0 && $$bindings.maxDepth && maxDepth !== void 0)
    $$bindings.maxDepth(maxDepth);
  canReply = comment.depth < MAX_DEPTH;
  canEdit = comment.user.id === currentUserId;
  isOwnComment = comment.user.id === currentUserId;
  showReplyButton = canReply && !isEditing;
  displayName = comment.user.displayName;
  initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  timeAgo = formatTimeAgo(new Date(comment.createdAt));
  linkifiedContent = linkifyMentions(comment.content, comment.mentions);
  return `<div class="${"comment " + escape(
    comment.depth > 0 ? "ml-4 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-spore-cream" : "",
    true
  )}"><div class="${"bg-spore-white rounded-lg p-4 " + escape(comment.depth > 0 ? "bg-spore-cream/30" : "", true)}">${` <div class="flex gap-3"> <div class="flex-shrink-0 w-8 h-8 rounded-full bg-spore-steel/20 flex items-center justify-center text-spore-steel font-bold text-xs">${escape(initials)}</div>  <div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="font-semibold text-spore-dark text-sm">${escape(displayName)}</span> <span class="text-spore-steel text-xs">${escape(timeAgo)}</span> ${comment.isEdited ? `<span class="text-spore-steel text-xs italic" title="${"Edited " + escape(
    comment.editedAt ? new Date(comment.editedAt).toLocaleString() : "",
    true
  )}">(edited)</span>` : ``}</div>  <div class="mt-1 text-sm text-spore-dark whitespace-pre-wrap break-words"><!-- HTML_TAG_START -->${linkifiedContent}<!-- HTML_TAG_END --></div>  <div class="mt-2 flex gap-3">${showReplyButton ? `<button class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors" data-svelte-h="svelte-11aykou">Reply</button>` : ``} ${canEdit && !comment.isDeleted ? `<button class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors" data-svelte-h="svelte-10p750a">Edit</button>` : ``} ${isOwnComment && !comment.isDeleted ? `<form method="POST" action="?/deleteComment"><input type="hidden" name="commentId"${add_attribute("value", comment.id, 0)}> <button type="submit" class="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors" data-svelte-h="svelte-x952ej">Delete</button></form>` : ``}</div>  ${``}</div></div>`}</div>  ${comment.replies && comment.replies.length > 0 ? `<div class="mt-2 space-y-2">${comment.replies.length > 2 && !showReplies ? `<button class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors ml-1">View ${escape(comment.replies.length)} ${escape(comment.replies.length === 1 ? "reply" : "replies")}</button>` : ``} ${`${each(comment.replies, (reply) => {
    return `${validate_component(Comment, "svelte:self").$$render(
      $$result,
      {
        comment: reply,
        currentUserId,
        mentionableUsers,
        maxDepth
      },
      {},
      {}
    )}`;
  })} ${comment.replies.length > 2 ? `<button class="text-xs font-semibold text-spore-steel hover:text-spore-orange transition-colors ml-1 mt-2" data-svelte-h="svelte-cghqzl">Hide replies</button>` : ``}`}</div>` : ``} </div>`;
});
function getReplyCount(comment) {
  if (!comment.replies || comment.replies.length === 0)
    return 0;
  return comment.replies.reduce((acc, reply) => acc + 1 + getReplyCount(reply), 0);
}
const CommentThread = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sortedComments;
  let commentCount;
  let totalReplies;
  let { comments } = $$props;
  let { currentUserId } = $$props;
  let { mentionableUsers } = $$props;
  let { workOrderId } = $$props;
  if ($$props.comments === void 0 && $$bindings.comments && comments !== void 0)
    $$bindings.comments(comments);
  if ($$props.currentUserId === void 0 && $$bindings.currentUserId && currentUserId !== void 0)
    $$bindings.currentUserId(currentUserId);
  if ($$props.mentionableUsers === void 0 && $$bindings.mentionableUsers && mentionableUsers !== void 0)
    $$bindings.mentionableUsers(mentionableUsers);
  if ($$props.workOrderId === void 0 && $$bindings.workOrderId && workOrderId !== void 0)
    $$bindings.workOrderId(workOrderId);
  sortedComments = [...comments].reverse();
  commentCount = comments.length;
  totalReplies = comments.reduce((acc, comment) => acc + getReplyCount(comment), 0);
  return `<div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-extrabold text-spore-dark mb-4 flex items-center gap-2"><span data-svelte-h="svelte-1rhak6r">💬</span> <span data-svelte-h="svelte-ki1h94">Comments</span> <span class="text-spore-steel font-normal text-sm">(${escape(commentCount)} ${escape(commentCount === 1 ? "comment" : "comments")} ${escape(totalReplies > 0 ? `, ${totalReplies} ${totalReplies === 1 ? "reply" : "replies"}` : "")})</span></h2>  <div class="mb-6 pb-6 border-b border-spore-cream">${validate_component(CommentForm, "CommentForm").$$render(
    $$result,
    {
      mentionableUsers,
      placeholder: "Add a comment... Use @ to mention someone",
      submitLabel: "Post Comment"
    },
    {},
    {}
  )}</div>  ${comments.length > 1 ? `<div class="flex items-center gap-2 mb-4"><span class="text-sm text-spore-steel" data-svelte-h="svelte-4r7bgb">Sort by:</span> <button class="${"text-sm font-semibold " + escape(
    "text-spore-orange",
    true
  ) + " transition-colors"}">Newest</button> <span class="text-spore-cream" data-svelte-h="svelte-12yd3tl">|</span> <button class="${"text-sm font-semibold " + escape(
    "text-spore-steel hover:text-spore-orange",
    true
  ) + " transition-colors"}">Oldest</button></div>` : ``}  ${sortedComments.length === 0 ? `<div class="text-center py-8"><p class="text-spore-steel italic" data-svelte-h="svelte-11odky4">No comments yet. Be the first to comment!</p></div>` : `<div class="space-y-4">${each(sortedComments, (comment) => {
    return `${validate_component(Comment, "Comment").$$render(
      $$result,
      {
        comment,
        currentUserId,
        mentionableUsers,
        maxDepth: 5
      },
      {},
      {}
    )}`;
  })}</div>`}</div>`;
});
function getStatusColor(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-spore-forest text-white";
    case "IN_PROGRESS":
      return "bg-spore-orange text-white";
    case "PENDING":
      return "bg-spore-steel text-white";
    case "ON_HOLD":
      return "bg-spore-cream text-spore-steel";
    case "CANCELLED":
      return "bg-red-600 text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let workOrder;
  let comments;
  let statusHistory;
  let checklistItems;
  let mentionableUsers;
  let currentUser;
  let { data } = $$props;
  let selectedStatus = null;
  const statuses = WORK_ORDER_STATUSES;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  workOrder = data.workOrder;
  data.assets || [];
  comments = data.comments || [];
  statusHistory = data.statusHistory || [];
  checklistItems = data.checklistItems || [];
  mentionableUsers = data.mentionableUsers || [];
  currentUser = data.user;
  return `<div class="max-w-4xl mx-auto px-4 py-10">${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(workOrder.title)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">Created ${escape(new Date(workOrder.createdAt).toLocaleDateString())}</p></div> <span class="${"px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor(workOrder.status), true)}">${escape(workOrder.status.replace("_", " "))}</span></div></div>  <div class="p-6 space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-exijn3">Asset</h3> <p class="text-spore-dark font-semibold">${escape(workOrder.asset?.name || "Unassigned")}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-2zeft2">Location</h3> <p class="text-spore-dark font-semibold">${workOrder.asset?.room ? `${escape(workOrder.asset.room.site?.name ?? "Unknown Site")} • Room ${escape(workOrder.asset.room.name ?? "Unknown Room")} ${workOrder.asset.room.building ? `• ${escape(workOrder.asset.room.building.name ?? "Unknown Building")}` : ``} ${workOrder.asset.room.floor ? `• Floor ${escape(workOrder.asset.room.floor)}` : ``}` : `No location`}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-11fnt6e">Last Updated</h3> <p class="text-spore-dark font-semibold">${escape(new Date(workOrder.updatedAt).toLocaleString())}</p></div></div>  ${workOrder.description ? `<div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-rq73nx">Description</h3> <p class="text-spore-dark whitespace-pre-wrap">${escape(workOrder.description)}</p></div>` : ``}  <div class="border-t border-spore-cream pt-6"><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-4" data-svelte-h="svelte-c3uwlf">Change Status</h3>  <div class="space-y-4"><div class="flex flex-wrap gap-2">${each(statuses, (status) => {
    return `${workOrder.status !== status ? `<button class="${"px-4 py-2 rounded-lg text-sm font-bold transition-colors " + escape(
      selectedStatus === status ? "ring-2 ring-offset-2 ring-spore-orange" : "",
      true
    ) + " " + escape(getStatusColor(status), true) + " hover:opacity-80"}">${escape(status.replace("_", " "))} </button>` : ``}`;
  })}</div>  ${``}</div></div>  <div class="border-t border-spore-cream pt-6 flex gap-4"><button class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" data-svelte-h="svelte-e0q83b">EDIT WORK ORDER</button> <form method="POST" action="?/delete"><button type="submit" class="px-6 py-3 rounded-lg font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors" data-svelte-h="svelte-1jld8fa">DELETE</button></form></div></div></div>`}  <div class="max-w-4xl mx-auto px-4 py-6">${validate_component(StatusHistory, "StatusHistory").$$render($$result, { history: statusHistory }, {}, {})}</div>  <div class="max-w-4xl mx-auto px-4 py-6">${validate_component(Checklist, "Checklist").$$render(
    $$result,
    {
      items: checklistItems,
      workOrderId: workOrder.id
    },
    {},
    {}
  )}</div>  <div class="max-w-4xl mx-auto px-4 py-6">${validate_component(CommentThread, "CommentThread").$$render(
    $$result,
    {
      comments,
      currentUserId: currentUser?.id || "",
      mentionableUsers,
      workOrderId: workOrder.id
    },
    {},
    {}
  )}</div></div>`;
});
export {
  Page as default
};
