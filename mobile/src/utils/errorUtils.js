export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (error.status) {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please verify entered information.';
      case 401:
        return 'Session expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found on the server.';
      case 500:
        return 'Internal server error. Our engineering team has been notified.';
      default:
        return error.message || 'Server returned an error. Please try again.';
    }
  }

  return error.message || 'Connection lost. Please check your internet connectivity.';
};

export default getFriendlyErrorMessage;
