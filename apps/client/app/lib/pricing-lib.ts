import { MFONI_PACKAGES_DETAILED } from "@/constants/index.ts";

interface IDetermineIfItsAnUpgradeOrDowngradeInput {
  activePackage: PackageType;
  changePackage: PackageType;
}

export const determineIfItsAnUpgradeOrDowngrade = ({
  activePackage,
  changePackage,
}: IDetermineIfItsAnUpgradeOrDowngradeInput) => {
  const levels = Object.keys(MFONI_PACKAGES_DETAILED) as Array<PackageType>;

  const oldPackageIndex = levels.indexOf(activePackage);
  const newPackageIndex = levels.indexOf(changePackage);

  if (newPackageIndex > oldPackageIndex) {
    return "UPGRADE";
  }

  if (newPackageIndex < oldPackageIndex) {
    return "DOWNGRADE";
  }

  return "NO_CHANGE";
};

export const isPackagePremium = (packageType: PackageType) =>
  packageType !== "FREE";

export const getPriceForPackage = (packageType: PackageType) => {
  const selectedPackage = MFONI_PACKAGES_DETAILED[packageType];

  return selectedPackage.amount;
};

export const getPriceForPackagePerDay = (packageType: PackageType) => {
  const selectedPackage = MFONI_PACKAGES_DETAILED[packageType];

  return selectedPackage.amount / 30;
};

export const getPackageUploadLimit = (packageType: PackageType) => {
  const selectedPackage = MFONI_PACKAGES_DETAILED[packageType];

  return selectedPackage.uploadLimit;
};
