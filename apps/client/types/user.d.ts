interface User {
    id: string;
    type: "USER" | "CREATOR";
    oauth2Type: "GOOGLE" | "TWITTER" | "FACEBOOK";
    oauth2Id: string;
    email: PossiblyUndefined<string>;
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
    createdAt: Date;
    updatedAt: Date;
}