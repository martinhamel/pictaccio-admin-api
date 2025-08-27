export interface Permission {
    granted: boolean;
    attributes: string[];
    filter: (data: any) => any;
    resource: string;
}
