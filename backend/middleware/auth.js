const verifyGoogleToken = async (req, res, next) => {
    const { token } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Google Client ID
      });
      const payload = ticket.getPayload();
      currentUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
      };
      next(); // Token is valid, proceed to the next middleware/route
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  };