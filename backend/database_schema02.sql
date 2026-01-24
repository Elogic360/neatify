--
-- PostgreSQL database dump
--

\restrict N0HvEX5FT1baY0D32KwccmUUiFZInxewddxL2yBoY3hkYt3sTh32WKLSmLpfU5b

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ecommerce_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ecommerce_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abandoned_carts; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.abandoned_carts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    cart_data jsonb NOT NULL,
    total_value numeric(10,2),
    abandoned_at timestamp with time zone DEFAULT now(),
    recovery_email_sent boolean DEFAULT false,
    recovered boolean DEFAULT false,
    recovered_at timestamp with time zone
);


ALTER TABLE public.abandoned_carts OWNER TO ecommerce_user;

--
-- Name: abandoned_carts_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.abandoned_carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.abandoned_carts_id_seq OWNER TO ecommerce_user;

--
-- Name: abandoned_carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.abandoned_carts_id_seq OWNED BY public.abandoned_carts.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.addresses (
    id bigint NOT NULL,
    user_id bigint,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    is_default boolean DEFAULT false,
    label character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.addresses OWNER TO ecommerce_user;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO ecommerce_user;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO ecommerce_user;

--
-- Name: bundle_products; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.bundle_products (
    bundle_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer DEFAULT 1
);


ALTER TABLE public.bundle_products OWNER TO ecommerce_user;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    user_id bigint,
    product_id bigint NOT NULL,
    variation_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cart_id bigint,
    unit_price numeric(10,2) DEFAULT 0,
    is_reserved boolean DEFAULT false,
    reserved_until timestamp without time zone,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO ecommerce_user;

--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO ecommerce_user;

--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    user_id bigint,
    session_id character varying(255),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone,
    subtotal numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) DEFAULT 0,
    promo_code character varying(50)
);


ALTER TABLE public.carts OWNER TO ecommerce_user;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO ecommerce_user;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    image_url text
);


ALTER TABLE public.categories OWNER TO ecommerce_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO ecommerce_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.coupon_usage (
    id bigint NOT NULL,
    coupon_id bigint NOT NULL,
    user_id bigint NOT NULL,
    order_id bigint,
    discount_applied numeric(10,2),
    used_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.coupon_usage OWNER TO ecommerce_user;

--
-- Name: coupon_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.coupon_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_usage_id_seq OWNER TO ecommerce_user;

--
-- Name: coupon_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.coupon_usage_id_seq OWNED BY public.coupon_usage.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.coupons (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2),
    max_discount_amount numeric(10,2),
    usage_limit integer,
    usage_count integer DEFAULT 0,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    applicable_categories jsonb DEFAULT '[]'::jsonb,
    applicable_products jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying, 'free_shipping'::character varying])::text[])))
);


ALTER TABLE public.coupons OWNER TO ecommerce_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO ecommerce_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.inventory_logs (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    change_quantity integer NOT NULL,
    new_stock integer,
    reason character varying(200),
    created_at timestamp with time zone DEFAULT now(),
    admin_id bigint,
    order_id bigint,
    CONSTRAINT inventory_logs_new_stock_check CHECK (((new_stock >= 0) OR (new_stock IS NULL)))
);


ALTER TABLE public.inventory_logs OWNER TO ecommerce_user;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.inventory_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_logs_id_seq OWNER TO ecommerce_user;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.inventory_logs_id_seq OWNED BY public.inventory_logs.id;


--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.loyalty_points (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    points integer NOT NULL,
    transaction_type character varying(50) NOT NULL,
    reference_id bigint,
    description text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.loyalty_points OWNER TO ecommerce_user;

--
-- Name: loyalty_points_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.loyalty_points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.loyalty_points_id_seq OWNER TO ecommerce_user;

--
-- Name: loyalty_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.loyalty_points_id_seq OWNED BY public.loyalty_points.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO ecommerce_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO ecommerce_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint,
    product_id bigint NOT NULL,
    variation_id bigint,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    CONSTRAINT order_items_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO ecommerce_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO ecommerce_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    changed_by integer,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.order_status_history OWNER TO ecommerce_user;

--
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_id_seq OWNER TO ecommerce_user;

--
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    user_id bigint,
    address_id bigint,
    order_number character varying(100) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    shipping_cost numeric(10,2) DEFAULT 0.0,
    tax_amount numeric(10,2) DEFAULT 0.0,
    payment_method character varying(50),
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tracking_number character varying(255),
    carrier character varying(100),
    estimated_delivery timestamp with time zone,
    coupon_code character varying(50),
    discount_amount numeric(10,2) DEFAULT 0,
    loyalty_points_earned integer DEFAULT 0,
    loyalty_points_used integer DEFAULT 0,
    CONSTRAINT orders_shipping_cost_check CHECK ((shipping_cost >= (0)::numeric)),
    CONSTRAINT orders_tax_amount_check CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO ecommerce_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO ecommerce_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    payment_method character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    amount numeric(10,2),
    transaction_id character varying(255),
    CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.payments OWNER TO ecommerce_user;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO ecommerce_user;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: price_history; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.price_history (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    changed_at timestamp with time zone DEFAULT now(),
    changed_by bigint,
    reason character varying(255)
);


ALTER TABLE public.price_history OWNER TO ecommerce_user;

--
-- Name: price_history_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.price_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.price_history_id_seq OWNER TO ecommerce_user;

--
-- Name: price_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.price_history_id_seq OWNED BY public.price_history.id;


--
-- Name: product_bundles; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.product_bundles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    discount_percentage numeric(5,2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.product_bundles OWNER TO ecommerce_user;

--
-- Name: product_bundles_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.product_bundles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_bundles_id_seq OWNER TO ecommerce_user;

--
-- Name: product_bundles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.product_bundles_id_seq OWNED BY public.product_bundles.id;


--
-- Name: product_category_association; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.product_category_association (
    product_id bigint NOT NULL,
    category_id bigint NOT NULL
);


ALTER TABLE public.product_category_association OWNER TO ecommerce_user;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.product_images (
    id bigint NOT NULL,
    product_id bigint,
    image_url text NOT NULL,
    alt_text text,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.product_images OWNER TO ecommerce_user;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO ecommerce_user;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_variations; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.product_variations (
    id bigint NOT NULL,
    product_id bigint,
    name character varying(100) NOT NULL,
    value character varying(100) NOT NULL,
    price_adjustment numeric(10,2) DEFAULT 0,
    stock integer DEFAULT 0,
    sku character varying(100),
    CONSTRAINT product_variations_price_adjustment_check CHECK ((price_adjustment IS NOT NULL)),
    CONSTRAINT product_variations_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.product_variations OWNER TO ecommerce_user;

--
-- Name: product_variations_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.product_variations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_variations_id_seq OWNER TO ecommerce_user;

--
-- Name: product_variations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.product_variations_id_seq OWNED BY public.product_variations.id;


--
-- Name: product_views; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.product_views (
    id bigint NOT NULL,
    user_id bigint,
    product_id bigint NOT NULL,
    session_id character varying(255),
    viewed_at timestamp with time zone DEFAULT now(),
    duration_seconds integer,
    device_type character varying(50),
    referrer text
);


ALTER TABLE public.product_views OWNER TO ecommerce_user;

--
-- Name: product_views_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.product_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_views_id_seq OWNER TO ecommerce_user;

--
-- Name: product_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.product_views_id_seq OWNED BY public.product_views.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    stock integer DEFAULT 0,
    sku character varying(100) NOT NULL,
    brand character varying(100),
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    rating numeric(2,1) DEFAULT 0,
    review_count integer DEFAULT 0,
    primary_image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    slug character varying(255),
    short_description character varying(500),
    sale_price numeric(10,2),
    average_rating numeric(3,2) DEFAULT 0,
    is_new boolean DEFAULT false,
    is_bestseller boolean DEFAULT false,
    metadata jsonb,
    view_count integer DEFAULT 0,
    tags jsonb DEFAULT '[]'::jsonb,
    meta_title character varying(255),
    meta_description text,
    weight numeric(8,2),
    dimensions jsonb,
    CONSTRAINT products_original_price_check CHECK (((original_price >= (0)::numeric) OR (original_price IS NULL))),
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))),
    CONSTRAINT products_review_count_check CHECK ((review_count >= 0)),
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO ecommerce_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO ecommerce_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: return_requests; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.return_requests (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    user_id bigint NOT NULL,
    reason character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying,
    refund_amount numeric(10,2),
    approved_by bigint,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT return_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.return_requests OWNER TO ecommerce_user;

--
-- Name: return_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.return_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.return_requests_id_seq OWNER TO ecommerce_user;

--
-- Name: return_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.return_requests_id_seq OWNED BY public.return_requests.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    product_id bigint,
    user_id bigint,
    rating integer NOT NULL,
    title character varying(255),
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified_purchase boolean DEFAULT false NOT NULL,
    is_approved boolean DEFAULT true NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO ecommerce_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO ecommerce_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.shipping_zones (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    countries jsonb NOT NULL,
    states jsonb,
    postal_codes jsonb,
    base_rate numeric(10,2) NOT NULL,
    per_item_rate numeric(10,2) DEFAULT 0,
    free_shipping_threshold numeric(10,2),
    estimated_days_min integer,
    estimated_days_max integer,
    is_active boolean DEFAULT true
);


ALTER TABLE public.shipping_zones OWNER TO ecommerce_user;

--
-- Name: shipping_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.shipping_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipping_zones_id_seq OWNER TO ecommerce_user;

--
-- Name: shipping_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.shipping_zones_id_seq OWNED BY public.shipping_zones.id;


--
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.tax_rates (
    id bigint NOT NULL,
    country character varying(2) NOT NULL,
    state character varying(100),
    city character varying(100),
    postal_code character varying(20),
    rate numeric(5,4) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tax_rates OWNER TO ecommerce_user;

--
-- Name: tax_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.tax_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tax_rates_id_seq OWNER TO ecommerce_user;

--
-- Name: tax_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.tax_rates_id_seq OWNED BY public.tax_rates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    full_name character varying(255),
    hashed_password text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(50) DEFAULT 'user'::character varying,
    loyalty_tier character varying(50) DEFAULT 'bronze'::character varying,
    loyalty_points integer DEFAULT 0,
    last_seen_at timestamp with time zone,
    preferred_currency character varying(3) DEFAULT 'USD'::character varying,
    phone_number character varying(20)
);


ALTER TABLE public.users OWNER TO ecommerce_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ecommerce_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.wishlists (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    added_at timestamp with time zone DEFAULT now(),
    price_at_addition numeric(10,2),
    notify_on_price_drop boolean DEFAULT true
);


ALTER TABLE public.wishlists OWNER TO ecommerce_user;

--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: ecommerce_user
--

CREATE SEQUENCE public.wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlists_id_seq OWNER TO ecommerce_user;

--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecommerce_user
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: abandoned_carts id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.abandoned_carts ALTER COLUMN id SET DEFAULT nextval('public.abandoned_carts_id_seq'::regclass);


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: coupon_usage id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupon_usage ALTER COLUMN id SET DEFAULT nextval('public.coupon_usage_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: inventory_logs id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory_logs ALTER COLUMN id SET DEFAULT nextval('public.inventory_logs_id_seq'::regclass);


--
-- Name: loyalty_points id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.loyalty_points ALTER COLUMN id SET DEFAULT nextval('public.loyalty_points_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: price_history id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.price_history ALTER COLUMN id SET DEFAULT nextval('public.price_history_id_seq'::regclass);


--
-- Name: product_bundles id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_bundles ALTER COLUMN id SET DEFAULT nextval('public.product_bundles_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_variations id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_variations ALTER COLUMN id SET DEFAULT nextval('public.product_variations_id_seq'::regclass);


--
-- Name: product_views id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_views ALTER COLUMN id SET DEFAULT nextval('public.product_views_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: return_requests id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.return_requests ALTER COLUMN id SET DEFAULT nextval('public.return_requests_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: shipping_zones id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.shipping_zones ALTER COLUMN id SET DEFAULT nextval('public.shipping_zones_id_seq'::regclass);


--
-- Name: tax_rates id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.tax_rates ALTER COLUMN id SET DEFAULT nextval('public.tax_rates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Name: abandoned_carts abandoned_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT abandoned_carts_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: bundle_products bundle_products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.bundle_products
    ADD CONSTRAINT bundle_products_pkey PRIMARY KEY (bundle_id, product_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: product_bundles product_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_pkey PRIMARY KEY (id);


--
-- Name: product_category_association product_category_association_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_category_association
    ADD CONSTRAINT product_category_association_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variations product_variations_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_pkey PRIMARY KEY (id);


--
-- Name: product_variations product_variations_sku_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_sku_key UNIQUE (sku);


--
-- Name: product_views product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: return_requests return_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: idx_abandoned_carts_abandoned_at; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_abandoned_carts_abandoned_at ON public.abandoned_carts USING btree (abandoned_at);


--
-- Name: idx_abandoned_carts_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_abandoned_carts_user_id ON public.abandoned_carts USING btree (user_id);


--
-- Name: idx_addresses_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);


--
-- Name: idx_cart_items_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_coupon_usage_coupon_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage USING btree (coupon_id);


--
-- Name: idx_coupon_usage_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage USING btree (user_id);


--
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);


--
-- Name: idx_coupons_valid_until; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_coupons_valid_until ON public.coupons USING btree (valid_until);


--
-- Name: idx_inventory_logs_admin_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_inventory_logs_admin_id ON public.inventory_logs USING btree (admin_id);


--
-- Name: idx_inventory_logs_order_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_inventory_logs_order_id ON public.inventory_logs USING btree (order_id);


--
-- Name: idx_inventory_logs_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_inventory_logs_product_id ON public.inventory_logs USING btree (product_id);


--
-- Name: idx_loyalty_points_expires_at; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_loyalty_points_expires_at ON public.loyalty_points USING btree (expires_at);


--
-- Name: idx_loyalty_points_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_loyalty_points_user_id ON public.loyalty_points USING btree (user_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_tracking_number; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_orders_tracking_number ON public.orders USING btree (tracking_number);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_transaction_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_payments_transaction_id ON public.payments USING btree (transaction_id);


--
-- Name: idx_price_history_changed_at; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_price_history_changed_at ON public.price_history USING btree (changed_at);


--
-- Name: idx_price_history_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_price_history_product_id ON public.price_history USING btree (product_id);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_product_variations_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_variations_product_id ON public.product_variations USING btree (product_id);


--
-- Name: idx_product_views_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_views_product_id ON public.product_views USING btree (product_id);


--
-- Name: idx_product_views_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_views_user_id ON public.product_views USING btree (user_id);


--
-- Name: idx_product_views_viewed_at; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_views_viewed_at ON public.product_views USING btree (viewed_at);


--
-- Name: idx_products_active_featured; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_active_featured ON public.products USING btree (is_active, is_featured);


--
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_name ON public.products USING btree (name);


--
-- Name: idx_products_price; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_price ON public.products USING btree (price);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_products_tags; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_tags ON public.products USING gin (tags);


--
-- Name: idx_products_view_count; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_products_view_count ON public.products USING btree (view_count);


--
-- Name: idx_return_requests_order_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_return_requests_order_id ON public.return_requests USING btree (order_id);


--
-- Name: idx_return_requests_status; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_return_requests_status ON public.return_requests USING btree (status);


--
-- Name: idx_reviews_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_tax_rates_location; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_tax_rates_location ON public.tax_rates USING btree (country, state, city);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_loyalty_tier; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_users_loyalty_tier ON public.users USING btree (loyalty_tier);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_wishlists_product_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_wishlists_product_id ON public.wishlists USING btree (product_id);


--
-- Name: idx_wishlists_user_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_wishlists_user_id ON public.wishlists USING btree (user_id);


--
-- Name: ix_order_status_history_order_id; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX ix_order_status_history_order_id ON public.order_status_history USING btree (order_id);


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: ecommerce_user
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: ecommerce_user
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: ecommerce_user
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: ecommerce_user
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: ecommerce_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: abandoned_carts abandoned_carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT abandoned_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bundle_products bundle_products_bundle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.bundle_products
    ADD CONSTRAINT bundle_products_bundle_id_fkey FOREIGN KEY (bundle_id) REFERENCES public.product_bundles(id) ON DELETE CASCADE;


--
-- Name: bundle_products bundle_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.bundle_products
    ADD CONSTRAINT bundle_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variation_id_fkey FOREIGN KEY (variation_id) REFERENCES public.product_variations(id);


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coupon_usage coupon_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: coupon_usage coupon_usage_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: coupon_usage coupon_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory_logs inventory_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: inventory_logs inventory_logs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: inventory_logs inventory_logs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: loyalty_points loyalty_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_items order_items_variation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variation_id_fkey FOREIGN KEY (variation_id) REFERENCES public.product_variations(id);


--
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: price_history price_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: price_history price_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_category_association product_category_association_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_category_association
    ADD CONSTRAINT product_category_association_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: product_category_association product_category_association_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_category_association
    ADD CONSTRAINT product_category_association_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_variations product_variations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_views product_views_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_views product_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: return_requests return_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: return_requests return_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: return_requests return_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO ecommerce_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO ecommerce_user;


--
-- PostgreSQL database dump complete
--

\unrestrict N0HvEX5FT1baY0D32KwccmUUiFZInxewddxL2yBoY3hkYt3sTh32WKLSmLpfU5b

