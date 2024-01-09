interface User {
    id: string;
    role: "CLIENT" | "CREATOR";
    type: "GOOGLE" | "TWITTER" | "FACEBOOK";
    name: string;
    oAuthId: string;
    email: PossiblyUndefined<string>;
    photo: PossiblyUndefined<string>;
    creatorApplication: PossiblyUndefined<string>;
    accountSetupAt: PossiblyUndefined<Date>;
    createdAt: Date;
    updatedAt: Date;
}

interface CreatorApplication {
    id: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedAt: PossiblyUndefined<Date>;
    approvedBy: PossiblyUndefined<string>;
    rejectedAt: PossiblyUndefined<Date>;
    rejectedBy: PossiblyUndefined<string>;
    platformAggrementForm: PossiblyUndefined<string>;
    ghanaCardFront: PossiblyUndefined<string>;
    ghanaCardBack: PossiblyUndefined<string>;
    createdAt: Date;
    createdBy: PossiblyUndefined<string>;
    updatedAt: Date;
}