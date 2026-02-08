// Lightweight dialogs utility - centralised confirm and notifications
// Keeps UI consistent and allows future replacement with a modal/toast library

export function confirmAction(message = "Are you sure you want to delete?") {
  try {
    return Promise.resolve(window.confirm(message));
  } catch (e) {
    // Fallback to true to avoid blocking in edge environments
    return Promise.resolve(true);
  }
}

export function showSuccess(message) {
  try {
    window.alert(message);
  } catch (e) {
    // noop
  }
}

export function showError(message) {
  try {
    window.alert(message);
  } catch (e) {
    // noop
  }
}
