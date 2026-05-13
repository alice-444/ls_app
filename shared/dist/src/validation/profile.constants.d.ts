export declare const PROFILE_VALIDATION: {
    readonly name: {
        readonly min: 3;
        readonly max: 120;
    };
    readonly bio: {
        readonly max: 300;
    };
    readonly photo: {
        readonly maxSizeMB: 2;
        readonly maxSizeBytes: number;
        readonly allowedTypes: readonly ["image/jpeg", "image/jpg", "image/png"];
        readonly allowedExtensions: readonly ["jpg", "jpeg", "png"];
    };
    readonly password: {
        readonly minLength: 8;
        readonly requireNumber: true;
    };
};
export declare const PROFILE_ERROR_MESSAGES: {
    readonly name: {
        readonly min: "Le nom doit contenir au moins 3 caractères";
        readonly max: "Le nom ne doit pas dépasser 120 caractères";
    };
    readonly bio: {
        readonly max: "La bio ne doit pas dépasser 300 caractères";
    };
    readonly photo: {
        readonly size: "La photo ne doit pas dépasser 2 Mo";
        readonly type: "Le fichier doit être au format JPG ou PNG";
    };
    readonly password: {
        readonly minLength: "Le mot de passe doit contenir au moins 8 caractères";
        readonly requireNumber: "Le mot de passe doit contenir au moins un chiffre";
        readonly match: "Les mots de passe ne correspondent pas";
    };
};
