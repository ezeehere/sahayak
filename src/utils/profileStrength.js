export function calculateProfileStrength(profile, seekerProfile) {
  const checks = [
    {
      key: "name",
      labelKey: "nameAdded",
      completed: Boolean(profile?.name),
    },
    {
      key: "phone",
      labelKey: "phoneAdded",
      completed: Boolean(profile?.phone),
    },
    {
      key: "skills",
      labelKey: "skillsAdded",
      completed: Boolean(seekerProfile?.skills),
    },
    {
      key: "experience",
      labelKey: "experienceAdded",
      completed: Boolean(seekerProfile?.experience),
    },
    {
      key: "location",
      labelKey: "locationAdded",
      completed: Boolean(seekerProfile?.location || seekerProfile?.preferred_location),
    },
    {
      key: "availability",
      labelKey: "availabilityAdded",
      completed: Boolean(seekerProfile?.availability),
    },
    {
      key: "expectedSalary",
      labelKey: "expectedSalaryAdded",
      completed: Boolean(seekerProfile?.expected_salary),
    },
    {
      key: "preferredJobType",
      labelKey: "preferredJobTypeAdded",
      completed: Boolean(seekerProfile?.preferred_job_type),
    },
  ];

  const completedCount = checks.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  return {
    percentage,
    completedCount,
    totalCount: checks.length,
    checks,
  };
}
