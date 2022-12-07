import sveltePreprocess from "svelte-preprocess";

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    replace: [[/__SERVER_URL__/, JSON.stringify("http://127.0.0.1:3000")]],
  }),
};
