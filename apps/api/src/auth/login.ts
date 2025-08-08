


export const loginHandler = () => {
    const scope = [
        "read:user",
        "repo",
        "read:org",
        "admin:repo_hook",
        "user:email"
    ].join(" ");

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_url: `${process.env.BACKEND_URL!}/api/auth/callback`,
        scope,
        allow_signup: "true"
    })

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`
    
    return Response.redirect(url, 302)
}