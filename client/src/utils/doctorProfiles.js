const DEFAULT_DOCTOR_AVATAR = '/default-doctor-avatar.svg';
const DEV_API_ORIGIN = 'http://localhost:3001';

export function getDoctorInitials(doctor = {}) {
  const first = doctor.FirstName?.[0] || doctor.PatientFirstName?.[0] || '';
  const last = doctor.LastName?.[0] || doctor.PatientLastName?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'DR';
}

export function resolveDoctorImageUrl(imageUrl) {
  if (!imageUrl) return DEFAULT_DOCTOR_AVATAR;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  if (import.meta.env.DEV) {
    return `${DEV_API_ORIGIN}${normalizedPath}`;
  }

  if (import.meta.env.VITE_API_ORIGIN) {
    return `${import.meta.env.VITE_API_ORIGIN}${normalizedPath}`;
  }

  return normalizedPath;
}

export function getDoctorImageUrl(doctor = {}) {
  return resolveDoctorImageUrl(doctor.ProfileImageUrl);
}

export function formatDoctorRating(doctor = {}) {
  const count = Number(doctor.ReviewCount || 0);
  const average = Number(doctor.AverageRating || 0);

  if (!count) {
    return 'New profile';
  }

  return `${average.toFixed(1)} / 5 (${count})`;
}
