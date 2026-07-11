import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password, inviteCode } = await request.json();

    // 기본 검증
    if (!username || !password || !inviteCode) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 30) {
      return NextResponse.json(
        { error: "아이디는 2~30자로 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 초대코드 검증
    const masterCode = process.env.INVITE_CODE;
    if (!masterCode) {
      return NextResponse.json(
        { error: "서버에 초대코드가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (inviteCode !== masterCode) {
      return NextResponse.json(
        { error: "올바르지 않은 초대코드입니다." },
        { status: 403 }
      );
    }

    // 아이디 중복 검사
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        inviteCode,
      },
    });

    return NextResponse.json(
      { message: "가입이 완료되었습니다.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
