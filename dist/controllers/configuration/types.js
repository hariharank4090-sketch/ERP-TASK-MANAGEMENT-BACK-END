"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapDbToApi = mapDbToApi;
function mapDbToApi(dbRow) {
    return {
        menuId: dbRow.id,
        parentId: dbRow.parent_id,
        slug: dbRow.name, // Use name as slug
        title: dbRow.name, // Use name as title
        iconKey: null,
        menuType: dbRow.menu_type,
        isActive: dbRow.is_active === 1,
        isVisible: true, // Default to true since your table doesn't have this
        sortOrder: dbRow.display_order,
        componentKey: null,
    };
}
