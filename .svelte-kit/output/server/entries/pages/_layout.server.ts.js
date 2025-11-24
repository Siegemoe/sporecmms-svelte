const load = async ({ locals }) => {
  return {
    user: locals.user ?? null
  };
};
export {
  load
};
