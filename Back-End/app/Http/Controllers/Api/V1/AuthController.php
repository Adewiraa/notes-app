<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Info(title="Notes App API", version="1.0", description="Notes App Backend API - Laravel")
 * @OA\SecurityScheme(securityScheme="bearerAuth", type="http", scheme="bearer", bearerFormat="JWT")
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(path="/api/v1/auth/login", tags={"Auth"},
     *   @OA\RequestBody(@OA\JsonContent(required={"email","password"},
     *     @OA\Property(property="email", type="string"),
     *     @OA\Property(property="password", type="string")
     *   )),
     *   @OA\Response(response=200, description="Login berhasil"),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * @OA\Post(path="/api/v1/auth/register", tags={"Auth"},
     *   @OA\RequestBody(@OA\JsonContent(required={"name","email","password"},
     *     @OA\Property(property="name", type="string"),
     *     @OA\Property(property="email", type="string"),
     *     @OA\Property(property="password", type="string", minLength=8)
     *   )),
     *   @OA\Response(response=201, description="Registrasi berhasil")
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = \App\Models\User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => 'user',
        ]);

        $token = Auth::guard('api')->login($user);

        return $this->respondWithToken($token, 201);
    }

    /**
     * @OA\Post(path="/api/v1/auth/refresh", tags={"Auth"}, security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Token diperbarui")
     * )
     */
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(Auth::guard('api')->refresh());
    }

    /**
     * @OA\Post(path="/api/v1/auth/logout", tags={"Auth"}, security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Logout berhasil")
     * )
     */
    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * @OA\Get(path="/api/v1/auth/me", tags={"Auth"}, security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Data user terautentikasi")
     * )
     */
    public function me(): JsonResponse
    {
        return response()->json(['data' => Auth::guard('api')->user()]);
    }

    private function respondWithToken(string $token, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => [
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
                'user'         => Auth::guard('api')->user(),
            ],
        ], $status);
    }
}
