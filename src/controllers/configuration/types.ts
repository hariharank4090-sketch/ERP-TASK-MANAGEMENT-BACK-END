// backend types to match frontend expectations
export interface MenuRowDB {
    id: number;
    name: string;
    menu_type: number;
    parent_id: number | null;
    url: string | null;
    tUrl: string | null;
    rUrl: string | null;
    actionType: string | null;
    display_order: number | null;
    is_active: number;
    created_at: Date;
}

export interface ApiMenuRow {
    menuId: number;      // Map from id
    parentId: number | null;
    slug: string;        // Map from name
    title: string;       // Map from name
    iconKey: string | null;
    menuType: number;    // Map from menu_type
    isActive: boolean;   // Map from is_active
    isVisible: boolean;  // Default true
    sortOrder: number | null;  // Map from display_order
    componentKey: string | null;
}

export function mapDbToApi(dbRow: MenuRowDB): ApiMenuRow {
    return {
        menuId: dbRow.id,
        parentId: dbRow.parent_id,
        slug: dbRow.name,  // Use name as slug
        title: dbRow.name, // Use name as title
        iconKey: null,
        menuType: dbRow.menu_type,
        isActive: dbRow.is_active === 1,
        isVisible: true, // Default to true since your table doesn't have this
        sortOrder: dbRow.display_order,
        componentKey: null,
    };
}